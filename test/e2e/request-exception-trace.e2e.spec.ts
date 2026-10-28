import { afterAll, beforeAll, beforeEach, describe, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { storyOf } from '$test/e2e/support/story-of';
import {
  appointStaff,
  assessedApplicationBy,
  deciderOf,
  keepDecisionReads,
  publishDelegationTable,
} from '$test/e2e/support/credit-application/decision-world';

const justified = { justification: 'The applicant has a stable salary and a guarantor.' };

/** The advisor limit of the table published here: the application asks for 12,345.67 euros, above it. */
const ADVISOR_LIMIT_CENTS = 500_000;

describe('Request an exception, one trace end to end', () => {
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
    await keepDecisionReads(application);
  });

  it('is one trace: the request, the use case and what it saves', async () => {
    await publishDelegationTable(application, ADVISOR_LIMIT_CENTS);
    const applicationId = await assessedBy();
    const advisor = await deciderOf(application, 'advisor');

    const trace = await tracing.traceOf(async () => {
      expectStatus(await advisor.post(`/applications/${applicationId}/exceptions`, justified), 204);
    });

    // Exact on names and structure: the request, the reads of the decider, the save of the file, then its event before commit.
    expectSpanTree(storyOf(trace), [
      {
        name: 'POST /applications/:id/exceptions',
        kind: 'SERVER',
        children: [
          {
            name: 'command RequestExceptionCommand',
            children: [
              { name: 'repository CreditApplicationRepository.findById' },
              { name: 'repository DeciderLevels.get' },
              { name: 'repository DelegationTables.search' },
              { name: 'repository DeclaredConflictsStore.searchOfCustomer' },
              { name: 'repository CreditApplicationRepository.save' },
              {
                name: 'unit-of-work before-commit',
                children: [{ name: 'domain-event credit-application.credit-application.exception-requested' }],
              },
            ],
          },
        ],
      },
    ]);
  });

  /** An application assessed by a credit analyst, who is not the decider of the test. */
  async function assessedBy(): Promise<string> {
    return assessedApplicationBy(application, false, await appointStaff(application, 'credit-analyst'));
  }
});
