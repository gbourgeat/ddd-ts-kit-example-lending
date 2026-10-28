import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { branchOperatorOf } from '$test/e2e/support/branch-network/branch-operator';
import { openedBranchOf } from '$test/e2e/support/branch-network/opened-branch';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { storyOf } from '$test/e2e/support/story-of';

const advisor = { name: 'Grace Hopper', email: 'grace@example.test', accountId: 'grace', level: 'advisor' };

/**
 * Exact on names and structure: the save, the fact announced under the unit of work with its two outbox appends
 * (versions 1 and 2), then the reaction that opens the advisor's portfolio.
 */
const appointingSpans = [
  {
    name: 'POST /branches/:id/staff',
    kind: 'SERVER' as const,
    children: [
      {
        name: 'command AppointStaffMemberCommand',
        children: [
          { name: 'repository BranchRepository.findById' },
          { name: 'repository StaffMemberRepository.save' },
          {
            name: 'unit-of-work before-commit',
            children: [
              {
                name: 'domain-event branch-network.staff-member.appointed',
                children: [
                  {
                    name: 'handler StaffMemberAppointedPublisher',
                    children: [
                      { name: 'outbox append branch-network.staff-member.appointed' },
                      { name: 'outbox append branch-network.staff-member.appointed' },
                    ],
                  },
                  {
                    name: 'handler OpenPortfolioForAdvisorEventHandler',
                    children: [
                      { name: 'repository StaffMemberRepository.findById' },
                      {
                        name: 'command OpenPortfolioCommand',
                        children: [{ name: 'repository PortfolioRepository.save' }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'unit-of-work before-commit',
            children: [{ name: 'domain-event branch-network.portfolio.opened' }],
          },
        ],
      },
    ],
  },
];

describe('Appoint staff member, end to end', () => {
  const tracing = installTestTracing();
  let application: RunningApplication;
  let operator: HttpClient;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
    tracing.uninstall();
  });

  beforeEach(async () => {
    await application.reset();
    operator = await branchOperatorOf(application);
  });

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.post('/branches/id-1/staff', {});

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold the permission', async () => {
    const stranger = await application.as({ id: 'stranger' });

    const response = await stranger.post('/branches/id-1/staff', advisor);

    expectStatus(response, 403);
  });

  it('answers 201 with the staff member appointed on the branch', async () => {
    const branchId = await openedBranchOf(operator);

    const response = await operator.post(`/branches/${branchId}/staff`, advisor);

    expectStatus(response, 201);
    expect(response.body).toEqual({ id: expect.any(String) });
  });

  it('is one trace: the request, the use case and what it saves', async () => {
    const branchId = await openedBranchOf(operator);

    const trace = await tracing.traceOf(async () => {
      expectStatus(await operator.post(`/branches/${branchId}/staff`, advisor), 201);
    });

    expectSpanTree(storyOf(trace), appointingSpans);
  });
});
