import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { operatorOf as policyOperatorOf } from '$test/e2e/support/credit-policy/operator-of';
import type { RunningApplication } from '$test/e2e/support/start-application';
import { appointStaff, assessedApplicationBy, deciderOf } from '$test/e2e/support/credit-application/decision-world';

const keepRateGridSystemActor = 'system:system:credit-application.keep-rate-grid';
const keepLegalMaximumRateSystemActor = 'system:system:credit-application.keep-legal-maximum-rate';

/** The grid of the personal loan: 5.9 per cent up to 36 months, 6.4 per cent up to 84 months. */
export const personalLoanGrid = {
  productId: 'personal-loan',
  effectiveFrom: '2026-01-01',
  rates: [
    { upToMonths: 36, rateBasisPoints: 590 },
    { upToMonths: 84, rateBasisPoints: 640 },
  ],
};

/** A decision that approves the requested amount, with no condition. */
export const plainApproval = { outcome: 'approve', reasons: '', conditions: '', approvedAmountCents: 0 };

/** A decision that approves a lower amount, with a condition. */
export const conditionalApproval = {
  ...plainApproval,
  outcome: 'approve-with-conditions',
  conditions: 'Fewer.',
  approvedAmountCents: 900_000,
};

/** Gives back the lines of the system actors that keep the rate grids and the legal maximum rates, emptied by the reset. */
export async function keepOfferReads(application: RunningApplication): Promise<void> {
  for (const subject of [keepRateGridSystemActor, keepLegalMaximumRateSystemActor]) {
    await application.relate({ object: 'context:credit-application', relation: 'keeper', subject });
  }
}

/** credit-policy publishes the grid and the legal maximum rate of the personal loan, effective from 2026-01-01. */
export async function publishPricing(application: RunningApplication, maximumBasisPoints: number): Promise<void> {
  const policy = await policyOperatorOf(application, 'ada');

  expectStatus(await policy.post('/rate-grids', personalLoanGrid), 201);

  await publishLegalMaximum(application, maximumBasisPoints, '2026-01-01');
}

/** credit-policy publishes a legal maximum rate of the personal loan, effective from the given day. */
export async function publishLegalMaximum(
  application: RunningApplication,
  maximumBasisPoints: number,
  effectiveFrom: string,
): Promise<void> {
  const policy = await policyOperatorOf(application, 'ada');

  expectStatus(
    await policy.post('/legal-maximum-rates', {
      category: 'personal',
      rateBasisPoints: maximumBasisPoints,
      effectiveFrom,
    }),
    201,
  );

  await application.settled();
}

/** An application assessed, then decided by an advisor with the given decision: its identifier. */
export async function approvedApplicationOf(
  application: RunningApplication,
  decision: typeof plainApproval,
): Promise<string> {
  const applicationId = await assessedApplicationBy(
    application,
    false,
    await appointStaff(application, 'credit-analyst'),
  );

  const advisor = await deciderOf(application, 'advisor');

  expectStatus(await advisor.post(`/applications/${applicationId}/decision`, decision), 201);

  return applicationId;
}
