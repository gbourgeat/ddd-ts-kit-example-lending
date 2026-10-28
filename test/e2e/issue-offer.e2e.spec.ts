import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { analystOf } from '$test/e2e/support/credit-application/assessed-application-world';
import { keepDecisionReads, publishDelegationTable } from '$test/e2e/support/credit-application/decision-world';
import {
  approvedApplicationOf,
  conditionalApproval,
  keepOfferReads,
  publishLegalMaximum,
  publishPricing,
} from '$test/e2e/support/credit-application/offer-world';
import { storyOf } from '$test/e2e/support/story-of';

/** A legal maximum published from this day is the one in force today: it replaces the one published from 2026-01-01. */
const laterEffectiveFrom = '2026-06-01';

describe('Issue the offer drafted for an application, end to end', () => {
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
    await keepOfferReads(application);
    await publishDelegationTable(application);
  });

  it('answers 401 to a caller who presents no credential', async () => {
    expectStatus(await application.client.post('/applications/id-1/offer', {}), 401);
  });

  it('answers 403 to an actor who does not hold offer.issue', async () => {
    const stranger = await application.as({ id: 'stranger', tenantId: 'acme-bank' });

    expectStatus(await stranger.post('/applications/id-1/offer', {}), 403);
  });

  it('issues the offer once its pre-contractual sheet is out, when its rate is under the legal maximum in force', async () => {
    await publishPricing(application, 1250);
    const applicationId = await approvedApplicationOf(application, conditionalApproval);
    const staff = await analystOf(application, 'offer-clerk');
    const drafted = expectStatus(await staff.post(`/applications/${applicationId}/offer-draft`, {}), 201);

    expectStatus(await staff.get(`/offers/${(drafted.body as { id: string }).id}/pre-contractual-sheet`), 200);

    expectStatus(await staff.post(`/applications/${applicationId}/offer`, {}), 204);
  });

  it('refuses to issue the offer whose rate is at the legal maximum in force that day, by its code', async () => {
    const { applicationId, staff, annualPercentageRateBasisPoints } = await draftedOffer(1250);

    await publishLegalMaximum(application, annualPercentageRateBasisPoints, laterEffectiveFrom);

    const response = await staff.post(`/applications/${applicationId}/offer`, {});

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'OFFER_ABOVE_LEGAL_MAXIMUM' });
  });

  it('refuses to issue an application that has no offer, by its code', async () => {
    const staff = await analystOf(application, 'offer-clerk');

    const response = await staff.post('/applications/no-offer-yet/offer', {});

    expect(response.body).toMatchObject({ code: 'UNKNOWN_OFFER' });
  });

  it('is one trace: the request, the use case and what it saves', async () => {
    const { applicationId, staff } = await draftedOffer(1250);

    const trace = await tracing.traceOf(async () => {
      expectStatus(await staff.post(`/applications/${applicationId}/offer`, {}), 204);
    });

    // Exact on names and structure, and kept before the tests whose request leaves work behind.
    expectSpanTree(storyOf(trace), [
      {
        name: 'POST /applications/:id/offer',
        kind: 'SERVER',
        children: [
          {
            name: 'command IssueOfferCommand',
            children: [
              { name: 'repository OfferRepository.findByApplicationId' },
              { name: 'repository OfferPricing.legalMaximumBasisPointsFor' },
              { name: 'repository OfferRepository.save' },
              {
                name: 'unit-of-work before-commit',
                children: [{ name: 'domain-event credit-application.offer.issued' }],
              },
            ],
          },
        ],
      },
    ]);
  });

  /** An approved application whose offer is drafted at the rate of the grid, under the given legal maximum in force. */
  async function draftedOffer(maximumBasisPoints: number) {
    await publishPricing(application, maximumBasisPoints);
    const applicationId = await approvedApplicationOf(application, conditionalApproval);
    const staff = await analystOf(application, 'offer-clerk');
    const drafted = expectStatus(await staff.post(`/applications/${applicationId}/offer-draft`, {}), 201);

    const sheet = expectStatus(
      await staff.get(`/offers/${(drafted.body as { id: string }).id}/pre-contractual-sheet`),
      200,
    );

    const annualPercentageRate = Number((sheet.body as { annualPercentageRate: string }).annualPercentageRate);

    return { applicationId, staff, annualPercentageRateBasisPoints: Math.round(annualPercentageRate * 100) };
  }
});
