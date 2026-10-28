import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { collectEvents, expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { branchOperatorOf } from '$test/e2e/support/branch-network/branch-operator';
import { openedBranchOf } from '$test/e2e/support/branch-network/opened-branch';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';

const tenantId = 'acme-bank';
const staffMemberAppointed = 'branch-network.staff-member.appointed';

/** The system actor of credit-application that keeps the levels of the deciders: the reset of the database empties its relationships. */
const keepDeciderLevelSystemActor = 'system:system:credit-application.keep-decider-level';

const advisor = { name: 'Grace Hopper', email: 'grace@example.test', accountId: 'grace', level: 'advisor' };

describe('Keep the level of each decider, end to end', () => {
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

    // The reset empties the relationships of the system actors too: the keeping of a level needs its line back.
    await application.relate({
      object: 'context:credit-application',
      relation: 'keeper',
      subject: keepDeciderLevelSystemActor,
    });

    operator = await branchOperatorOf(application);
  });

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.get('/deciders/staff-member-1/level');

    expectStatus(response, 401);
  });

  it('answers 403 to a caller who does not hold application.decide', async () => {
    await appointAdvisor();
    const stranger = await application.as({ id: 'stranger', tenantId });

    const response = await stranger.get('/deciders/staff-member-1/level');

    expectStatus(response, 403);
  });

  it('answers the level the staff member was appointed to, to a decider', async () => {
    const staffMemberId = await appointAdvisor();
    const decider = await deciderOf('decider-1');

    const answer = expectStatus(await decider.get(`/deciders/${staffMemberId}/level`), 200);

    expect(answer.body).toMatchObject({ staffMemberId, level: 'advisor' });
  });

  it('refuses a staff member who was never appointed, with the code UNKNOWN_DECIDER_LEVEL', async () => {
    const decider = await deciderOf('decider-1');

    const response = await decider.get('/deciders/unknown-staff-member/level');

    expect(response.body).toMatchObject({ code: 'UNKNOWN_DECIDER_LEVEL' });
  });

  /** Appoints an advisor on an opened branch as branch-network does, waits for the level to be kept, and returns the staff member's identifier. */
  async function appointAdvisor(): Promise<string> {
    const published = collectEvents(application.events, [staffMemberAppointed]);
    const branchId = await openedBranchOf(operator);

    expectStatus(await operator.post(`/branches/${branchId}/staff`, advisor), 201);
    await application.settled();
    published.stop();

    const [event] = published.received(staffMemberAppointed);

    return (event?.payload as { staffMemberId: string }).staffMemberId;
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
