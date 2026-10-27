import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { collectEvents, expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startKeycloakStandIn } from '$test/e2e/support/identity/keycloak-stand-in';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { operatorOf, registeredCustomer } from '$test/e2e/support/customer-due-diligence/customer-files';

const advisor = { name: 'Grace Hopper', email: 'grace@example.test' };
const tenantId = 'acme-bank';

/** The system actors of branch-network whose relationships the reset of the database empties. */
const branchNetworkSystemActors = [
  'system:system:OpenPortfolioForAdvisorEventHandler',
  'system:system:branch-network.assign-identified-customer',
];

describe('Assign advisor, end to end', () => {
  let application: RunningApplication;
  let provider: { close: () => Promise<void> };

  beforeAll(async () => {
    provider = await startKeycloakStandIn();
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
    await provider.close();
  });

  beforeEach(async () => {
    await application.reset();

    // The reset empties the relationships, those the application wrote for its system actors too. The reactions of
    // branch-network run as these actors: the appointment opens the portfolio, the assignment joins the customer.
    for (const subject of branchNetworkSystemActors) {
      await application.relate({ object: 'context:branch-network', relation: 'operator', subject });
    }
  });

  it('gives an identified customer its advisor, as an operator', async () => {
    const operator = await operatorOf(application, 'ada');
    const customerId = await registeredCustomer(operator);
    const advisorId = await appointedAdvisor();

    const assigned = await operator.put(`/customers/${customerId}/advisor`, { advisorId });

    expectStatus(assigned, 200);
    expect(assigned.body).toEqual({ id: customerId });
  });

  it('publishes the advisor assignment for the other contexts, with the customer and the advisor', async () => {
    const operator = await operatorOf(application, 'ada');
    const customerId = await registeredCustomer(operator);
    const advisorId = await appointedAdvisor();
    const recorder = collectEvents(application.events, ['customer-due-diligence.customer.advisor-assigned']);

    expectStatus(await operator.put(`/customers/${customerId}/advisor`, { advisorId }), 200);

    await application.settled();
    recorder.stop();

    expect(recorder.received('customer-due-diligence.customer.advisor-assigned')).toEqual([
      expect.objectContaining({ payload: { customerId, advisorId } }),
    ]);
  });

  it('refuses the advisor of an unknown customer, and assigns nothing', async () => {
    const operator = await operatorOf(application, 'ada');

    const assigned = await operator.put('/customers/unknown/advisor', { advisorId: 'advisor-1' });

    expect(assigned.status).toBeGreaterThanOrEqual(400);
    expect(assigned.body).toMatchObject({ code: 'UNKNOWN_CUSTOMER' });
  });

  /** Opens a branch, appoints the advisor on it as the branch operator, and returns the id of the staff member made. */
  async function appointedAdvisor(): Promise<string> {
    await application.relate({ object: 'context:branch-network', relation: 'operator', subject: 'user:ada' });
    const ada = await application.as({ id: 'ada', tenantId });
    const opened = await ada.post('/branches', {});

    expectStatus(opened, 201);
    const { id: branchId } = opened.body as { id: string };

    const appointed = await ada.post(`/branches/${branchId}/staff`, advisor);

    expectStatus(appointed, 201);

    return (appointed.body as { id: string }).id;
  }
});
