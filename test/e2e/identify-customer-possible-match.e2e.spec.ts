import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { storyOf } from '$test/e2e/support/story-of';
import { aPersonBody, operatorOf } from '$test/e2e/support/customer-due-diligence/customer-files';
import type { SpanNode } from '@ddd-ts-kit/tracing/testing';

const ADA_BIRTH_DATE = '1980-05-01T00:00:00.000Z';
const POSSIBLE_MATCH_SPAN = 'domain-event customer-due-diligence.customer.possible-match-found';

describe('Identify customer with a possible match, end to end', () => {
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

  it('identifies the customer when the screening finds a possible match', async () => {
    application.screening.record('Ada Lovelace', new Date(ADA_BIRTH_DATE));
    const ada = await operatorOf(application, 'ada');

    const identified = await ada.post('/customers', aPersonBody('12AB34567'));

    expectStatus(identified, 201);
    expect(identified.body).toEqual({ id: expect.any(String) });
  });

  it('records a possible match for compliance when the screening finds the person on a list', async () => {
    application.screening.record('Ada Lovelace', new Date(ADA_BIRTH_DATE));
    const ada = await operatorOf(application, 'ada');

    const trace = await tracing.traceOf(async () => {
      expectStatus(await ada.post('/customers', aPersonBody('12AB34567')), 201);
    });

    expect(spanNamesOf(storyOf(trace))).toContain(POSSIBLE_MATCH_SPAN);
  });

  it('identifies a person the lists do not hold, and records no possible match for it', async () => {
    const ada = await operatorOf(application, 'ada');
    const grace = { ...aPersonBody('98ZY76543'), name: 'Grace Hopper', birthDate: '1906-12-09T00:00:00.000Z' };

    const trace = await tracing.traceOf(async () => {
      expectStatus(await ada.post('/customers', grace), 201);
    });

    expect(spanNamesOf(storyOf(trace))).not.toContain(POSSIBLE_MATCH_SPAN);
  });
});

/** The names of every span of a trace, the spans under each of them included. */
function spanNamesOf(trace: readonly SpanNode[]): string[] {
  return trace.flatMap((span) => [span.name, ...spanNamesOf(span.children)]);
}
