import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing, type SpanNode } from '@ddd-ts-kit/tracing/testing';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { storyOf } from '$test/e2e/support/story-of';
import { aPersonBody, operatorOf } from '$test/e2e/support/customer-due-diligence/customer-files';

const ADA_BIRTH_DATE = '1980-05-01T00:00:00.000Z';
const SANCTIONS_MATCH_CONFIRMED_SPAN = 'domain-event customer-due-diligence.customer.sanctions-match-confirmed';

describe('Confirm sanctions match, end to end', () => {
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
  });

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.post('/customers/id-1/matches/confirm', {});

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold the permission', async () => {
    const stranger = await application.as({ id: 'stranger' });

    const response = await stranger.post('/customers/id-1/matches/confirm', {});

    expectStatus(response, 403);
  });

  it('answers 201 when compliance confirms the possible match of a screened customer', async () => {
    application.screening.record('Ada Lovelace', new Date(ADA_BIRTH_DATE));
    const compliance = await operatorOf(application, 'compliance');
    const { id } = (await compliance.post('/customers', aPersonBody('12AB34567'))).body as { id: string };

    const response = await compliance.post(`/customers/${id}/matches/confirm`, {});

    expectStatus(response, 201);
    expect(response.body).toEqual({ id });
  });

  it('records the sanctions match when compliance confirms it', async () => {
    application.screening.record('Ada Lovelace', new Date(ADA_BIRTH_DATE));
    const compliance = await operatorOf(application, 'compliance');
    const { id } = (await compliance.post('/customers', aPersonBody('12AB34567'))).body as { id: string };

    await application.settled();

    const trace = await tracing.traceOf(async () => {
      expectStatus(await compliance.post(`/customers/${id}/matches/confirm`, {}), 201);
    });

    expect(spanNamesOf(storyOf(trace))).toContain(SANCTIONS_MATCH_CONFIRMED_SPAN);
  });

  it('refuses a second confirmation of the same match, with its code', async () => {
    application.screening.record('Ada Lovelace', new Date(ADA_BIRTH_DATE));
    const compliance = await operatorOf(application, 'compliance');
    const { id } = (await compliance.post('/customers', aPersonBody('12AB34567'))).body as { id: string };

    expectStatus(await compliance.post(`/customers/${id}/matches/confirm`, {}), 201);

    const second = await compliance.post(`/customers/${id}/matches/confirm`, {});

    expect(second.status).toBeGreaterThanOrEqual(400);
    expect(second.body).toMatchObject({ code: 'NO_POSSIBLE_MATCH' });
  });

  it('refuses to confirm a customer whose screening found no possible match', async () => {
    const compliance = await operatorOf(application, 'compliance');
    const grace = { ...aPersonBody('98ZY76543'), name: 'Grace Hopper', birthDate: '1906-12-09T00:00:00.000Z' };
    const { id } = (await compliance.post('/customers', grace)).body as { id: string };

    const response = await compliance.post(`/customers/${id}/matches/confirm`, {});

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'NO_POSSIBLE_MATCH' });
  });

  it('refuses to confirm an unknown customer', async () => {
    const compliance = await operatorOf(application, 'compliance');

    const response = await compliance.post('/customers/unknown/matches/confirm', {});

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'UNKNOWN_CUSTOMER' });
  });

  it('is one trace: the request, the use case and what it saves', async () => {
    application.screening.record('Ada Lovelace', new Date(ADA_BIRTH_DATE));
    const compliance = await operatorOf(application, 'compliance');
    const { id } = (await compliance.post('/customers', aPersonBody('12AB34567'))).body as { id: string };

    await application.settled();

    const trace = await tracing.traceOf(async () => {
      expectStatus(await compliance.post(`/customers/${id}/matches/confirm`, {}), 201);
    });

    // Exact on names and structure: the request, the use case, its reads and the save of the customer.
    expectSpanTree(storyOf(trace), [
      {
        name: 'POST /customers/:id/matches/confirm',
        kind: 'SERVER',
        children: [
          {
            name: 'command ConfirmSanctionsMatchCommand',
            children: [
              { name: 'repository CustomerRepository.findById' },
              { name: 'repository CustomerRepository.save' },
              {
                name: 'unit-of-work before-commit',
                children: [{ name: 'domain-event customer-due-diligence.customer.sanctions-match-confirmed' }],
              },
            ],
          },
        ],
      },
    ]);
  });
});

/** The names of every span of a trace, the spans under each of them included. */
function spanNamesOf(trace: readonly SpanNode[]): string[] {
  return trace.flatMap((span) => [span.name, ...spanNamesOf(span.children)]);
}
