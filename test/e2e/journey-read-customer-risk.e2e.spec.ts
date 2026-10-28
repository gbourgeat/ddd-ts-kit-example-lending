import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { aPersonBody, operatorOf } from '$test/e2e/support/customer-due-diligence/customer-files';

const tenantId = 'acme-bank';
const ADA_BIRTH_DATE = '1980-05-01T00:00:00.000Z';
const GRACE_BIRTH_DATE = '1906-12-09T00:00:00.000Z';

/** The system actors of branch-network whose relationships the reset of the database empties. */
const branchNetworkSystemActors = [
  'system:system:OpenPortfolioForAdvisorEventHandler',
  'system:system:branch-network.assign-identified-customer',
];

/** The customer of the advisor Grace, and the other advisor Alan, whose portfolios hold no such customer. */
interface Setup {
  readonly customerId: string;
  readonly graceId: string;
  readonly alanId: string;
}

describe('Reading the risk and the due diligence of a customer, end to end', () => {
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();

    for (const subject of branchNetworkSystemActors) {
      await application.relate({ object: 'context:branch-network', relation: 'operator', subject });
    }

    await application.relate({ object: 'context:customer-due-diligence', relation: 'operator', subject: 'user:carol' });
    application.screening.record('Ada Lovelace', new Date(ADA_BIRTH_DATE));
  });

  it('shows the risk rating and the due diligence to the compliance officer of the context', async () => {
    const { customerId } = await customerOfAdvisor(application);
    const carol = await application.as({ id: 'carol', roles: [], tenantId });

    const risk = await carol.get(`/customers/${customerId}/risk-rating`);
    const diligence = await carol.get(`/customers/${customerId}/due-diligence`);

    expectStatus(risk, 200);
    expectStatus(diligence, 200);
    expect(risk.body).toHaveProperty('riskRating');
    expect(diligence.body).toHaveProperty('nextDueOn');
  });

  it('shows the risk rating and the due diligence to the advisor whose portfolio holds the customer', async () => {
    const { customerId, graceId } = await customerOfAdvisor(application);
    const grace = await application.as({ id: graceId, tenantId });

    const risk = await grace.get(`/customers/${customerId}/risk-rating`);
    const diligence = await grace.get(`/customers/${customerId}/due-diligence`);

    expectStatus(risk, 200);
    expectStatus(diligence, 200);
    expect(risk.body).toHaveProperty('riskRating');
    expect(diligence.body).toHaveProperty('nextDueOn');
  });

  it('shows neither the risk rating nor the due diligence to the advisor of another portfolio', async () => {
    const { customerId, alanId, graceId } = await customerOfAdvisor(application);

    expect(alanId).not.toBe(graceId);
    const alan = await application.as({ id: alanId, tenantId });

    const risk = await alan.get(`/customers/${customerId}/risk-rating`);
    const diligence = await alan.get(`/customers/${customerId}/due-diligence`);

    expect(risk.body).not.toHaveProperty('riskRating');
    expect(diligence.body).not.toHaveProperty('nextDueOn');
  });

  it('lets the compliance officer rate the risk, refresh the due diligence and dismiss a possible match', async () => {
    const { customerId } = await customerOfAdvisor(application);
    const carol = await application.as({ id: 'carol', roles: [], tenantId });

    expectStatus(await carol.put(`/customers/${customerId}/risk`, { rating: 'medium' }), 200);

    expectStatus(
      await carol.post(`/customers/${customerId}/refresh`, { name: 'Ada Lovelace', birthDate: ADA_BIRTH_DATE }),
      201,
    );

    const possible = await identifyPossibleMatch(application);

    expectStatus(await carol.post(`/customers/${possible}/matches/dismiss`, { reason: 'Another person' }), 201);
  });
});

/** Identifies a customer, rates it, appoints the advisors Grace and Alan, and assigns the customer to Grace. */
async function customerOfAdvisor(app: RunningApplication): Promise<Setup> {
  const ada = await operatorOf(app, 'ada');
  const { graceId, alanId } = await appointAdvisors(app);
  const identified = await ada.post('/customers', aPersonBody('12AB34567'));

  expectStatus(identified, 201);

  const { id: customerId } = identified.body as { id: string };

  expectStatus(await ada.put(`/customers/${customerId}/risk`, { rating: 'low' }), 200);

  expectStatus(
    await ada.post(`/customers/${customerId}/refresh`, { name: 'Ada Lovelace', birthDate: ADA_BIRTH_DATE }),
    201,
  );

  expectStatus(await ada.put(`/customers/${customerId}/advisor`, { advisorId: graceId }), 200);
  await app.settled();

  return { customerId, graceId, alanId };
}

/** Identifies a person whose name the screening finds: a possible match, returned as the customer's identifier. */
async function identifyPossibleMatch(app: RunningApplication): Promise<string> {
  app.screening.record('Grace Hopper', new Date(GRACE_BIRTH_DATE));
  const ada = await operatorOf(app, 'ada');

  const identified = await ada.post('/customers', {
    ...aPersonBody('98ZY76543'),
    name: 'Grace Hopper',
    birthDate: GRACE_BIRTH_DATE,
  });

  expectStatus(identified, 201);

  return (identified.body as { id: string }).id;
}

/** Opens a branch and appoints two advisors on it: each appointment opens a portfolio of its own. */
async function appointAdvisors(app: RunningApplication): Promise<{ graceId: string; alanId: string }> {
  await app.relate({ object: 'context:branch-network', relation: 'operator', subject: 'user:ada' });
  const ada = await app.as({ id: 'ada', roles: [], tenantId });
  const opened = await ada.post('/branches', {});

  expectStatus(opened, 201);

  const { id: branchId } = opened.body as { id: string };

  const grace = expectStatus(
    await ada.post(`/branches/${branchId}/staff`, { name: 'Grace Hopper', email: 'grace@example.test' }),
    201,
  );

  const alan = expectStatus(
    await ada.post(`/branches/${branchId}/staff`, { name: 'Alan Turing', email: 'alan@example.test' }),
    201,
  );

  await app.settled();

  return { graceId: staffMemberIdOf(grace.body), alanId: staffMemberIdOf(alan.body) };
}

/** The identifier of the staff member a appointment answered with. */
function staffMemberIdOf(body: unknown): string {
  return (body as { id: string }).id;
}
