import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { collectEvents, expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { branchOperatorOf } from '$test/e2e/support/branch-network/branch-operator';
import { openedBranchOf } from '$test/e2e/support/branch-network/opened-branch';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';

const advisor = { name: 'Grace Hopper', email: 'grace@example.test', accountId: 'grace', level: 'advisor' };
const appointed = 'branch-network.staff-member.appointed';

describe('Appoint staff member with its level, end to end', () => {
  let application: RunningApplication;
  let operator: HttpClient;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();
    operator = await branchOperatorOf(application);
  });

  it('publishes the appointment as version 2, with the branch and the level of the appointment', async () => {
    const branchId = await openedBranchOf(operator);
    const recorder = collectEvents(application.events, [appointed]);

    const response = await operator.post(`/branches/${branchId}/staff`, advisor);

    expectStatus(response, 201);
    const { id: staffMemberId } = response.body as { id: string };

    await application.settled();
    recorder.stop();

    expect(recorder.received(appointed)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          version: 2,
          payload: { staffMemberId, branchId, level: 'advisor' },
        }),
      ]),
    );
  });

  it('publishes the appointment as version 1 too, for the consumers not yet moved', async () => {
    const branchId = await openedBranchOf(operator);
    const recorder = collectEvents(application.events, [appointed]);

    const response = await operator.post(`/branches/${branchId}/staff`, advisor);

    expectStatus(response, 201);
    const { id: staffMemberId } = response.body as { id: string };

    await application.settled();
    recorder.stop();

    expect(recorder.received(appointed)).toEqual(
      expect.arrayContaining([expect.objectContaining({ version: 1, payload: { staffMemberId } })]),
    );
  });

  it('publishes the level of each appointment as it was made', async () => {
    const branchId = await openedBranchOf(operator);
    const recorder = collectEvents(application.events, [appointed]);

    expectStatus(await operator.post(`/branches/${branchId}/staff`, advisor), 201);

    expectStatus(
      await operator.post(`/branches/${branchId}/staff`, {
        name: 'Alan Turing',
        email: 'alan@example.test',
        accountId: 'alan',
        level: 'risk-manager',
      }),
      201,
    );

    await application.settled();
    recorder.stop();

    const levels = recorder
      .received(appointed)
      .filter((event) => event.version === 2)
      .map((event) => (event.payload as { level: string }).level);

    expect(levels.sort()).toEqual(['advisor', 'risk-manager']);
  });
});
