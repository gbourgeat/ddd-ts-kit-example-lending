import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';

const tenantId = 'acme-bank';

/** The system actors of branch-network that open the portfolio of an appointed staff member: the reset of the database empties their relationships. */
const branchNetworkSystemActors = ['system:system:OpenPortfolioForAdvisorEventHandler'];

describe('Read declared conflicts, end to end', () => {
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();

    // The reset empties the relationships of the system actors too: the appointment of a staff member needs them back.
    for (const subject of branchNetworkSystemActors) {
      await application.relate({ object: 'context:branch-network', relation: 'operator', subject });
    }
  });

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.get('/applications/application-1/declared-conflicts');

    expectStatus(response, 401);
  });

  it('answers 403 to the applicant, who holds no decision of the context', async () => {
    const id = await submitAs('customer-5');
    const applicant = await application.as({ id: 'customer-5', tenantId });

    const response = await applicant.get(`/applications/${id}/declared-conflicts`);

    expectStatus(response, 403);
  });

  it('lists the conflict declared on the applicant to the decider, once the event is heard', async () => {
    const id = await submitAs('customer-2');
    const decider = await deciderOf('decider-1');

    await declareConflictOfInterest('staff-2', 'customer-2');
    await application.settled();

    const answer = expectStatus(await decider.get(`/applications/${id}/declared-conflicts`), 200);

    expect(answer.body).toMatchObject({ conflicts: [{ customerId: 'customer-2', staffMemberId: expect.any(String) }] });
  });

  it('leaves out a conflict declared on a customer who is not the applicant', async () => {
    const id = await submitAs('customer-1');
    const decider = await deciderOf('decider-1');

    await declareConflictOfInterest('staff-1', 'customer-2');
    await application.settled();

    const answer = expectStatus(await decider.get(`/applications/${id}/declared-conflicts`), 200);

    expect(answer.body).toMatchObject({ conflicts: [] });
  });

  it('refuses an application that does not exist, with the code UNKNOWN_CREDIT_APPLICATION', async () => {
    const decider = await deciderOf('decider-1');

    const response = await decider.get('/applications/unknown-application/declared-conflicts');

    expect(response.body).toMatchObject({ code: 'UNKNOWN_CREDIT_APPLICATION' });
  });

  /** A member of staff of a branch they opened declares a conflict of interest on `customerId`. */
  async function declareConflictOfInterest(staffAccountId: string, customerId: string): Promise<void> {
    await application.relate({
      object: 'context:branch-network',
      relation: 'operator',
      subject: `user:${staffAccountId}`,
    });

    const staff = await application.as({ id: staffAccountId, tenantId });
    const opened = expectStatus(await staff.post('/branches', {}), 201);
    const { id: branchId } = opened.body as { id: string };

    expectStatus(
      await staff.post(`/branches/${branchId}/staff`, {
        name: 'Grace Hopper',
        email: `${staffAccountId}@example.test`,
        accountId: staffAccountId,
      }),
      201,
    );

    expectStatus(await staff.post('/conflicts', { customerId }), 201);
  }

  /** The customer gets its relationship to itself, then submits one loan: the identifier of the application comes back. */
  async function submitAs(customerId: string): Promise<string> {
    await application.relate({ object: `customer:${customerId}`, relation: 'self', subject: `user:${customerId}` });
    const customer: HttpClient = await application.as({ id: customerId, tenantId });

    const submitted = expectStatus(
      await customer.post('/applications', {
        productId: 'personal-loan',
        amount: { cents: 1234567, currency: 'EUR' },
        durationMonths: 60,
      }),
      201,
    );

    return (submitted.body as { id: string }).id;
  }

  /** A decider holds the decision of the context: an operator of credit-application. */
  async function deciderOf(accountId: string): Promise<HttpClient> {
    await application.relate({
      object: 'context:credit-application',
      relation: 'operator',
      subject: `user:${accountId}`,
    });

    return application.as({ id: accountId, tenantId });
  }
});
