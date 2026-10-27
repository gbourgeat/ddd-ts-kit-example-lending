import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';

const ONE_HOUR_MS = 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * ONE_HOUR_MS;
const ISSUED_AT = new Date('2026-10-27T08:00:00.000Z');

/** The clock of the application is the `Date` the process reads: only it moves, the timers keep running. */
const TIMERS_KEPT_REAL = [
  'setTimeout',
  'clearTimeout',
  'setInterval',
  'clearInterval',
  'setImmediate',
  'clearImmediate',
  'nextTick',
  'queueMicrotask',
  'hrtime',
  'performance',
] as const;

/** The copy the started application answers, with the link the customer or the operator downloads it by. */
interface IssuedCopy {
  readonly copyId: string;
  readonly url: string;
  readonly expiresAt: string;
}

describe('A customer asks for a copy of all we keep about them, end to end', () => {
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();
    await openOrganisation(application);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('answers 201 with the copy and the link that downloads it', async () => {
    const customer = await selfOf(application, 'customer-1');

    const response = await customer.post('/data-subjects/customer-1/copies', {});

    expectStatus(response, 201);

    expect(response.body).toMatchObject({
      copyId: expect.any(String),
      url: expect.stringContaining('token='),
      expiresAt: expect.any(String),
    });
  });

  it('downloads through the link the copy of what the bank keeps about the customer', async () => {
    const customer = await selfOf(application, 'customer-1');
    const issued = await issue(customer, 'customer-1');

    const download = await application.client.get(pathOf(issued.url));

    expectStatus(download, 200);
    expect(download.body).toMatchObject({ subject: 'customer-1' });
  });

  it('answers a fresh one-hour link to the customer, and to an operator of data-protection, within seven days', async () => {
    const customer = await selfOf(application, 'customer-1');
    const issued = await issue(customer, 'customer-1');
    const ada = await operatorOf(application, 'ada');

    const asked = await ada.get(`/data-subjects/customer-1/copies/${issued.copyId}/link`);
    const again = await customer.get(`/data-subjects/customer-1/copies/${issued.copyId}/link`);

    expectStatus(asked, 200);
    expectStatus(again, 200);
    expect(asked.body).toMatchObject({ copyId: issued.copyId, url: expect.stringContaining('token=') });
    expect(expiresAtOf(asked.body)).toBe(expiresAtOf(again.body));
  });

  it('answers the link that expires one hour after the answer', async () => {
    jest.useFakeTimers({ now: ISSUED_AT, doNotFake: [...TIMERS_KEPT_REAL] });
    const customer = await selfOf(application, 'customer-1');
    const issued = await issue(customer, 'customer-1');

    jest.setSystemTime(new Date(ISSUED_AT.getTime() + SEVEN_DAYS_MS - ONE_HOUR_MS));

    const fresh = await (await selfOf(application, 'customer-1')).get(
      `/data-subjects/customer-1/copies/${issued.copyId}/link`,
    );

    expectStatus(fresh, 200);
    expect(Date.parse(expiresAtOf(fresh.body))).toBe(ISSUED_AT.getTime() + SEVEN_DAYS_MS);
  });

  it('refuses with 403 another customer asking for the link of this copy', async () => {
    const customer = await selfOf(application, 'customer-1');
    const issued = await issue(customer, 'customer-1');
    const other = await selfOf(application, 'customer-2');

    const response = await other.get(`/data-subjects/customer-1/copies/${issued.copyId}/link`);

    expectStatus(response, 403);
  });

  it('answers 404 after seven days, the copy being deleted: its link no longer downloads', async () => {
    jest.useFakeTimers({ now: ISSUED_AT, doNotFake: [...TIMERS_KEPT_REAL] });
    const customer = await selfOf(application, 'customer-1');
    const issued = await issue(customer, 'customer-1');

    jest.setSystemTime(new Date(ISSUED_AT.getTime() + SEVEN_DAYS_MS));
    const later = await selfOf(application, 'customer-1');

    expectStatus(await later.get(`/data-subjects/customer-1/copies/${issued.copyId}/link`), 404);
    // The link given seven days ago expired an hour after it was given: the storage refuses it, whatever the copy.
    expectStatus(await application.client.get(pathOf(issued.url)), 403);
  });
});

/** The customer signs in as herself: the relation of her own data is stored, as the identity provider does at her first sign-in. */
async function selfOf(application: RunningApplication, customerId: string): Promise<HttpClient> {
  await application.relate({ object: `customer:${customerId}`, relation: 'self', subject: `user:${customerId}` });

  return application.as({ id: customerId });
}

async function operatorOf(application: RunningApplication, id: string): Promise<HttpClient> {
  await application.relate({ object: 'context:data-protection', relation: 'operator', subject: `user:${id}` });

  return application.as({ id });
}

/** The customer asks for her copy and reads the answer: the identifier of the copy, and its link. */
async function issue(customer: HttpClient, customerId: string): Promise<IssuedCopy> {
  const response = await customer.post(`/data-subjects/${customerId}/copies`, {});

  expectStatus(response, 201);

  return response.body as IssuedCopy;
}

/**
 * The bank's organisation exists: a copy is gathered in every tenant the organisations of identity list,
 * and a copy of nothing is refused. Opened as the admin who signs up the organisation.
 */
async function openOrganisation(application: RunningApplication): Promise<void> {
  await application.relate({ object: 'context:identity', relation: 'operator', subject: 'user:ada' });
  const ada = await application.as({ id: 'ada', roles: ['admin'], tenantId: 'acme-bank' });

  expectStatus(await ada.put('/accounts/me', {}), 200);
  expectStatus(await ada.post('/organisations', { slug: 'acme-bank', name: 'Acme Bank' }), 201);
}

/** The path and the query of a signed link: the application answers its own links, whatever host the link names. */
function pathOf(url: string): string {
  const { pathname, search } = new URL(url);

  return pathname + search;
}

function expiresAtOf(body: unknown): string {
  return (body as { expiresAt: string }).expiresAt;
}
