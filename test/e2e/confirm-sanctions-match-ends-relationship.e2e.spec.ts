import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { installTestTracing, type SpanNode } from '@ddd-ts-kit/tracing/testing';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { storyOf } from '$test/e2e/support/story-of';
import { aPersonBody, operatorOf } from '$test/e2e/support/customer-due-diligence/customer-files';

const ADA_BIRTH_DATE = '1980-05-01T00:00:00.000Z';
const RELATIONSHIP_ENDED_SPAN = 'domain-event customer-due-diligence.customer.relationship-ended';
const END_RELATIONSHIP_SPAN = 'command EndRelationshipCommand';

describe('Confirm sanctions match ends the relationship, end to end', () => {
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

    await application.relate({
      object: 'context:customer-due-diligence',
      relation: 'operator',
      subject: 'system:system:EndRelationshipOnSanctionsMatchEventHandler',
    });
  });

  it('ends the relationship with the customer in the same transaction as the confirmation', async () => {
    application.screening.record('Ada Lovelace', new Date(ADA_BIRTH_DATE));
    const compliance = await operatorOf(application, 'compliance');
    const { id } = (await compliance.post('/customers', aPersonBody('12AB34567'))).body as { id: string };

    await application.settled();

    const trace = await tracing.traceOf(async () => {
      expectStatus(await compliance.post(`/customers/${id}/matches/confirm`, {}), 201);
    });

    expect(spanNamesOf(storyOf(trace))).toEqual(
      expect.arrayContaining([END_RELATIONSHIP_SPAN, RELATIONSHIP_ENDED_SPAN]),
    );
  });
});

/** The names of every span of a trace, the spans under each of them included. */
function spanNamesOf(trace: readonly SpanNode[]): string[] {
  return trace.flatMap((span) => [span.name, ...spanNamesOf(span.children)]);
}
