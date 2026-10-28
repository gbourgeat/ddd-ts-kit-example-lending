import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { collectEvents, expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { operatorOf } from '$test/e2e/support/credit-policy/operator-of';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';

const tenantId = 'acme-bank';
const delegationTablePublished = 'credit-policy.delegation-table.published';

/** The system actor of credit-application that keeps the delegation tables: the reset of the database empties its relationships. */
const keepDelegationTableSystemActor = 'system:system:credit-application.keep-delegation-table';

const delegationTable = {
  effectiveFrom: '2026-03-01',
  advisorLimitCents: 1_500_000,
  creditAnalystLimitCents: 7_500_000,
  riskManagerLimitCents: 25_000_000,
  creditCommitteeLimitCents: 100_000_000,
};

describe('Keep delegation table, end to end', () => {
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();

    // The reset empties the relationships of the system actors too: the keeping of a table needs its line back.
    await application.relate({
      object: 'context:credit-application',
      relation: 'keeper',
      subject: keepDelegationTableSystemActor,
    });
  });

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.get('/delegation-tables/delegation-table-1');

    expectStatus(response, 401);
  });

  it('answers 403 to a caller who does not hold application.decide', async () => {
    await publishDelegationTable();
    const stranger = await application.as({ id: 'stranger', tenantId });

    const response = await stranger.get('/delegation-tables/delegation-table-1');

    expectStatus(response, 403);
  });

  it('answers the levels of the table credit-policy published, to a decider', async () => {
    const delegationTableId = await publishDelegationTable();
    const decider = await deciderOf('decider-1');

    const answer = expectStatus(await decider.get(`/delegation-tables/${delegationTableId}`), 200);

    expect(answer.body).toMatchObject({
      delegationTableId,
      effectiveFrom: '2026-03-01T00:00:00.000Z',
      levels: expect.arrayContaining([expect.objectContaining({ amountCents: 1_500_000 })]),
    });
  });

  it('refuses a delegation table that was never published, with the code UNKNOWN_DELEGATION_TABLE', async () => {
    const decider = await deciderOf('decider-1');

    const response = await decider.get('/delegation-tables/unknown-delegation-table');

    expect(response.body).toMatchObject({ code: 'UNKNOWN_DELEGATION_TABLE' });
  });

  /** Sets the table as credit-policy's operator does, waits for it to be kept, and returns the identifier credit-policy gave it. */
  async function publishDelegationTable(): Promise<string> {
    const published = collectEvents(application.events, [delegationTablePublished]);
    const operator = await operatorOf(application, 'ada');

    expectStatus(await operator.put('/delegation-table', delegationTable), 200);
    await application.settled();
    published.stop();

    const [event] = published.received(delegationTablePublished);

    return event.payload.delegationTableId as string;
  }

  async function deciderOf(accountId: string): Promise<HttpClient> {
    await application.relate({
      object: 'context:credit-application',
      relation: 'operator',
      subject: `user:${accountId}`,
    });

    return application.as({ id: accountId, tenantId });
  }
});
