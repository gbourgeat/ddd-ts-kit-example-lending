import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import {
  appointStaff,
  assessedApplicationBy,
  deciderOf,
  keepDecisionReads,
  publishDelegationTable,
} from '$test/e2e/support/credit-application/decision-world';

const ASSESSED = 'credit-application.credit-application.assessed';
const approval = { outcome: 'approve', reasons: '', conditions: '', approvedAmountCents: 0 };

describe('Read a version 1 stream of Assessed through its upcaster, end to end', () => {
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();
    await keepDecisionReads(application);
    await publishDelegationTable(application);
  });

  it('decides an application whose assessment was stored at version 1, with no assessor', async () => {
    const applicationId = await assessedApplicationBy(
      application,
      false,
      await appointStaff(application, 'credit-analyst'),
    );

    const version1 = await storeAssessmentAsVersion1(applicationId);
    const advisor = await deciderOf(application, 'advisor');

    const decided = await advisor.post(`/applications/${applicationId}/decision`, approval);

    expect(version1).toBe(1);
    expectStatus(decided, 201);
  });

  /** Rewrites the stored assessment to the shape version 1 had: no assessor. Returns the version now stored. */
  async function storeAssessmentAsVersion1(applicationId: string): Promise<number> {
    const store = application.persistence.database.client().storedEvent;
    const row = await store.findFirstOrThrow({ where: { type: ASSESSED, stream: { contains: applicationId } } });
    const { assessorId: _assessorId, ...version1Data } = row.data as Record<string, unknown>;

    await store.update({ where: { position: row.position }, data: { schemaVersion: 1, data: version1Data } });

    return (await store.findUniqueOrThrow({ where: { position: row.position } })).schemaVersion;
  }
});
