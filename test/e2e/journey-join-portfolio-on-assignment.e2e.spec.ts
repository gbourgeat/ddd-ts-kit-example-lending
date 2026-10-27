import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { collectEvents, expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { customerAdvisorAssignedV1 } from '@/contexts/customer-due-diligence/published-language';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';

const tenantId = 'acme-bank';
const advisor = { name: 'Grace Hopper', email: 'grace@example.test' };
const meta = { id: 'advisor-assigned-1', occurredAt: '2026-01-01T00:00:00.000Z' };

describe('An identified customer joins the advisor portfolio, end to end', () => {
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  it('shows, to the advisor, the customer given to the advisor by AdvisorAssigned', async () => {
    const staffMemberId = await openPortfolioForAdvisor();
    const grace = await application.as({ id: staffMemberId, tenantId });
    const portfolioId = await onlyPortfolioOf(grace);

    await application.publish([
      { ...customerAdvisorAssignedV1.create({ customerId: 'customer-7', advisorId: staffMemberId }, meta), tenantId },
    ]);

    await application.settled();

    const customers = await grace.get(`/portfolios/${portfolioId}/customers`);

    expectStatus(customers, 200);
    expect(customers.body).toMatchObject({ items: [{ id: 'customer-7' }], total: 1 });
  });

  it('refuses a signed-in actor who is not the advisor of the portfolio', async () => {
    const staffMemberId = await openPortfolioForAdvisor();
    const grace = await application.as({ id: staffMemberId, tenantId });
    const portfolioId = await onlyPortfolioOf(grace);
    const stranger = await application.as({ id: 'stranger-1', tenantId });

    const customers = await stranger.get(`/portfolios/${portfolioId}/customers`);

    expectStatus(customers, 403);
  });

  it('refuses with the code FORBIDDEN a portfolio that does not exist, before revealing it is absent', async () => {
    const staffMemberId = await openPortfolioForAdvisor();
    const grace = await application.as({ id: staffMemberId, tenantId });

    const customers = await grace.get('/portfolios/portfolio-unknown/customers');

    expect(customers.status).toBeGreaterThanOrEqual(400);
    expect(customers.body).toMatchObject({ code: 'FORBIDDEN' });
  });

  /** Opens the branch, appoints the advisor on it, and returns the identifier of the advisor the appointment made. */
  async function openPortfolioForAdvisor(): Promise<string> {
    await application.relate({ object: 'context:branch-network', relation: 'operator', subject: 'user:ada' });
    const ada = await application.as({ id: 'ada', tenantId });
    const opened = await ada.post('/branches', {});

    expectStatus(opened, 201);
    const { id: branchId } = opened.body as { id: string };

    const appointed = collectEvents(application.events, ['branch-network.staff-member.appointed']);

    expectStatus(await ada.post(`/branches/${branchId}/staff`, advisor), 201);
    await application.settled();
    appointed.stop();

    const [event] = appointed.received('branch-network.staff-member.appointed');

    return (event as unknown as { payload: { staffMemberId: string } }).payload.staffMemberId;
  }
});

/** The advisor lists the portfolios it holds: the one its appointment opened. */
async function onlyPortfolioOf(advisorClient: HttpClient): Promise<string> {
  const listed = await advisorClient.get('/portfolios');

  expectStatus(listed, 200);

  const { items } = listed.body as { items: { id: string }[] };

  return items[0]?.id ?? '';
}
