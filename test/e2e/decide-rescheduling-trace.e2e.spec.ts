import { afterAll, beforeAll, beforeEach, describe, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { storyOf } from '$test/e2e/support/story-of';
import {
  deciderOf,
  keepDecisionReads,
  publishDelegationTable,
} from '$test/e2e/support/credit-application/decision-world';
import { approvedApplicationOf } from '$test/e2e/support/credit-application/rescheduling-world';

const rescheduling = { durationMonths: 48, outstandingAmountCents: 1_000_000 };

describe('Decide a rescheduling, one trace end to end', () => {
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
    await publishDelegationTable(application);
  });

  it('is one trace: the request, the use case, what it saves and the event it announces', async () => {
    const applicationId = await approvedApplicationOf(application);
    const advisor = await deciderOf(application, 'advisor');

    const trace = await tracing.traceOf(async () => {
      expectStatus(await advisor.post(`/applications/${applicationId}/rescheduling-decision`, rescheduling), 204);
    });

    // Exact on names and structure: the reads of the handler, its save, then the event in the before-commit phase.
    expectSpanTree(storyOf(trace), [
      {
        name: 'POST /applications/:id/rescheduling-decision',
        kind: 'SERVER',
        children: [
          {
            name: 'command DecideReschedulingCommand',
            children: [
              { name: 'repository CreditApplicationRepository.findById' },
              { name: 'repository DeciderLevels.get' },
              { name: 'repository DelegationTables.search' },
              { name: 'repository DeclaredConflictsStore.searchOfCustomer' },
              { name: 'repository CreditApplicationRepository.save' },
              {
                name: 'unit-of-work before-commit',
                children: [{ name: 'domain-event credit-application.credit-application.reschedule-decided' }],
              },
            ],
          },
        ],
      },
    ]);
  });
});
