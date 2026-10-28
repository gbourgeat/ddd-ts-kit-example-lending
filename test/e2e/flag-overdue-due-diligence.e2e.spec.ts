import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { storyOf } from '$test/e2e/support/story-of';
import { operatorOf, registeredCustomer } from '$test/e2e/support/customer-due-diligence/customer-files';

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

/** The day the customer is identified and its due diligence refreshed. */
const REFRESHED_ON = new Date('2026-10-28T08:00:00.000Z');

/** The system actors of branch-network whose relationships the reset of the database empties. */
const branchNetworkSystemActors = [
  'system:system:OpenPortfolioForAdvisorEventHandler',
  'system:system:branch-network.assign-identified-customer',
];

describe('Flag overdue due diligence, end to end', () => {
  const tracing = installTestTracing();
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
    tracing.uninstall();
  });

  beforeEach(async () => {
    await application.reset();

    for (const subject of branchNetworkSystemActors) {
      await application.relate({ object: 'context:branch-network', relation: 'operator', subject });
    }
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.post('/customers/customer-id-1/due-diligence/flag-overdue', {});

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold the permission', async () => {
    const stranger = await application.as({ id: 'stranger' });

    const response = await stranger.post('/customers/customer-id-1/due-diligence/flag-overdue', {});

    expectStatus(response, 403);
  });

  it('is one trace: the request, the use case and what it reads and saves', async () => {
    const operator = await operatorAt(application, REFRESHED_ON);
    const customerId = await refreshedCustomer(operator, 'low');

    const trace = await tracing.traceOf(async () => {
      expectStatus(await operator.post(`/customers/${customerId}/due-diligence/flag-overdue`, {}), 201);
    });

    // Exact on names and structure, and kept before the tests whose request leaves work behind (a relay still publishing would add its spans here).
    expectSpanTree(storyOf(trace), [
      {
        name: 'POST /customers/:customerId/due-diligence/flag-overdue',
        kind: 'SERVER',
        children: [
          {
            name: 'command FlagOverdueDueDiligenceCommand',
            children: [
              { name: 'repository CustomerRepository.findById' },
              { name: 'repository CustomerRepository.save' },
            ],
          },
        ],
      },
    ]);
  });

  it('flags the due diligence of a customer whose refresh is past its date, and reads back the day of the flag', async () => {
    const operator = await operatorAt(application, REFRESHED_ON);
    const customerId = await refreshedCustomer(operator, 'low');
    const fiveYearsAndADayLater = new Date('2031-10-29T08:00:00.000Z');
    const later = await operatorAt(application, fiveYearsAndADayLater);

    const flagged = await later.post(`/customers/${customerId}/due-diligence/flag-overdue`, {});

    expectStatus(flagged, 201);
    expect(flagged.body).toEqual({ id: customerId });
    expect(await flaggedOverdueOn(later, customerId)).toBe(fiveYearsAndADayLater.toISOString());
  });

  it('leaves a due diligence current on the day it falls due', async () => {
    const operator = await operatorAt(application, REFRESHED_ON);
    const customerId = await refreshedCustomer(operator, 'low');
    const dueDay = await operatorAt(application, new Date('2031-10-28T08:00:00.000Z'));

    expectStatus(await dueDay.post(`/customers/${customerId}/due-diligence/flag-overdue`, {}), 201);

    expect(await flaggedOverdueOn(dueDay, customerId)).toBeUndefined();
  });

  it('flags a high risk customer one year after its refresh, the cadence of its risk', async () => {
    const operator = await operatorAt(application, REFRESHED_ON);
    const customerId = await refreshedCustomer(operator, 'high');
    const yearAfter = await operatorAt(application, new Date('2027-10-29T08:00:00.000Z'));

    expectStatus(await yearAfter.post(`/customers/${customerId}/due-diligence/flag-overdue`, {}), 201);

    expect(await flaggedOverdueOn(yearAfter, customerId)).toBe('2027-10-29T08:00:00.000Z');
  });

  it('keeps the day of the first flag when the overdue due diligence is flagged again', async () => {
    const operator = await operatorAt(application, REFRESHED_ON);
    const customerId = await refreshedCustomer(operator, 'low');
    const firstFlag = await operatorAt(application, new Date('2031-10-29T08:00:00.000Z'));

    expectStatus(await firstFlag.post(`/customers/${customerId}/due-diligence/flag-overdue`, {}), 201);
    const weekLater = await operatorAt(application, new Date('2031-11-05T08:00:00.000Z'));

    expectStatus(await weekLater.post(`/customers/${customerId}/due-diligence/flag-overdue`, {}), 201);

    expect(await flaggedOverdueOn(weekLater, customerId)).toBe('2031-10-29T08:00:00.000Z');
  });

  it('clears the flag when the due diligence is refreshed again', async () => {
    const operator = await operatorAt(application, REFRESHED_ON);
    const customerId = await refreshedCustomer(operator, 'low');
    const firstFlag = await operatorAt(application, new Date('2031-10-29T08:00:00.000Z'));

    expectStatus(await firstFlag.post(`/customers/${customerId}/due-diligence/flag-overdue`, {}), 201);
    const nextDay = await operatorAt(application, new Date('2031-10-30T08:00:00.000Z'));

    expectStatus(
      await nextDay.post(`/customers/${customerId}/refresh`, { name: 'Ada Lovelace', birthDate: '1990-01-01' }),
      201,
    );

    expect(await flaggedOverdueOn(nextDay, customerId)).toBeUndefined();
  });

  it('refuses the flag of an unknown customer, with UNKNOWN_CUSTOMER', async () => {
    const operator = await operatorAt(application, REFRESHED_ON);

    const flagged = await operator.post('/customers/unknown/due-diligence/flag-overdue', {});

    expect(flagged.status).toBeGreaterThanOrEqual(400);
    expect(flagged.body).toMatchObject({ code: 'UNKNOWN_CUSTOMER' });
  });
});

/** An operator signing in at the given day: the clock of the application moves there, the timers keep running. */
async function operatorAt(application: RunningApplication, now: Date): Promise<HttpClient> {
  jest.useFakeTimers({ now, doNotFake: [...TIMERS_KEPT_REAL] });

  return operatorOf(application, 'ada');
}

/** A customer identified and registered, rated at the given level, and whose due diligence is refreshed on the day of the operator. */
async function refreshedCustomer(operator: HttpClient, rating: 'low' | 'medium' | 'high'): Promise<string> {
  const customerId = await registeredCustomer(operator);

  expectStatus(await operator.put(`/customers/${customerId}/risk`, { rating }), 200);

  expectStatus(
    await operator.post(`/customers/${customerId}/refresh`, { name: 'Ada Lovelace', birthDate: '1990-01-01' }),
    201,
  );

  return customerId;
}

/** The day the due diligence was flagged overdue, as the read of the due diligence gives it back. */
async function flaggedOverdueOn(operator: HttpClient, customerId: string): Promise<string | undefined> {
  const read = await operator.get(`/customers/${customerId}/due-diligence`);

  expectStatus(read, 200);

  return (read.body as { flaggedOverdueOn?: string }).flaggedOverdueOn;
}
