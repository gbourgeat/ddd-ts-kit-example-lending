import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { operatorOf as policyOperatorOf } from '$test/e2e/support/credit-policy/operator-of';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { analystOf, submittedApplication } from '$test/e2e/support/credit-application/assessed-application-world';
import {
  appointStaff,
  assessedApplicationBy,
  deciderOf,
  keepDecisionReads,
  publishDelegationTable,
} from '$test/e2e/support/credit-application/decision-world';
import { keepOfferReads } from '$test/e2e/support/credit-application/offer-world';

const grid = {
  productId: 'personal-loan',
  effectiveFrom: '2026-01-01',
  rates: [
    { upToMonths: 36, rateBasisPoints: 590 },
    { upToMonths: 84, rateBasisPoints: 640 },
  ],
};

const approval = { outcome: 'approve', reasons: '', conditions: '', approvedAmountCents: 0 };

const conditional = {
  ...approval,
  outcome: 'approve-with-conditions',
  conditions: 'Fewer.',
  approvedAmountCents: 900_000,
};

describe('Draft the offer of an approved application, end to end', () => {
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
    await keepOfferReads(application);
    await publishDelegationTable(application);
  });

  it('answers 401 to a caller who presents no credential', async () => {
    expectStatus(await application.client.post('/applications/id-1/offer-draft', {}), 401);
  });

  it('answers 403 to an actor who does not hold offer.draft', async () => {
    const stranger = await application.as({ id: 'stranger', tenantId: 'acme-bank' });

    expectStatus(await stranger.post('/applications/id-1/offer-draft', {}), 403);
  });

  it('drafts the offer at the amount approved, the rate of the grid and its annual percentage rate, and states it on the sheet', async () => {
    await publishPricing(1250);
    const applicationId = await approvedApplication(conditional);
    const staff = await analystOf(application, 'offer-clerk');

    const drafted = expectStatus(await staff.post(`/applications/${applicationId}/offer-draft`, {}), 201);

    const sheet = expectStatus(
      await staff.get(`/offers/${(drafted.body as { id: string }).id}/pre-contractual-sheet`),
      200,
    );

    expect(sheet.body).toMatchObject({
      applicationId,
      amountCents: 900_000,
      durationMonths: 60,
      rateBasisPoints: 640,
      arrangementFeeCents: 0,
    });

    expect(Number((sheet.body as { annualPercentageRate: string }).annualPercentageRate)).toBeGreaterThan(6.4);
  });

  it('refuses to draft the offer when its annual percentage rate is above the legal maximum in force, by its code', async () => {
    await publishPricing(500);
    const applicationId = await approvedApplication(approval);
    const staff = await analystOf(application, 'offer-clerk');

    const response = await staff.post(`/applications/${applicationId}/offer-draft`, {});

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'OFFER_ABOVE_LEGAL_MAXIMUM' });
  });

  it('refuses to draft the offer of an application no decision approved, by its code', async () => {
    await publishPricing(1250);
    const { applicationId } = await submittedApplication(application);
    const staff = await analystOf(application, 'offer-clerk');

    const response = await staff.post(`/applications/${applicationId}/offer-draft`, {});

    expect(response.body).toMatchObject({ code: 'APPLICATION_NOT_APPROVED' });
  });

  it('refuses the sheet of an offer that does not exist, by its code', async () => {
    const staff = await analystOf(application, 'offer-clerk');

    const response = await staff.get('/offers/nobody/pre-contractual-sheet');

    expect(response.body).toMatchObject({ code: 'UNKNOWN_OFFER' });
  });

  /** credit-policy publishes the grid and the legal maximum rate of the product; credit-application keeps them. */
  async function publishPricing(maximumBasisPoints: number): Promise<void> {
    const policy = await policyOperatorOf(application, 'ada');

    expectStatus(await policy.post('/rate-grids', grid), 201);

    expectStatus(
      await policy.post('/legal-maximum-rates', {
        category: 'personal',
        rateBasisPoints: maximumBasisPoints,
        effectiveFrom: '2026-01-01',
      }),
      201,
    );

    await application.settled();
  }

  /** An application assessed, then approved by an advisor with the decision given. */
  async function approvedApplication(decision: typeof approval): Promise<string> {
    const applicationId = await assessedApplicationBy(
      application,
      false,
      await appointStaff(application, 'credit-analyst'),
    );

    const advisor = await deciderOf(application, 'advisor');

    expectStatus(await advisor.post(`/applications/${applicationId}/decision`, decision), 201);

    return applicationId;
  }
});
