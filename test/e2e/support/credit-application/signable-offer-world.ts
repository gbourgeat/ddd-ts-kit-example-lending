import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import type { RunningApplication } from '$test/e2e/support/start-application';
import {
  analystOf,
  publishScoringVersion,
  readAccountsAndRegister,
  submittedApplication,
} from '$test/e2e/support/credit-application/assessed-application-world';
import { appointStaff, deciderOf } from '$test/e2e/support/credit-application/decision-world';
import { conditionalApproval, publishPricing } from '$test/e2e/support/credit-application/offer-world';

/** The applicant's application, its offer issued to the borrower, and the clients that act on them. */
export interface IssuedOffer {
  readonly applicationId: string;
  readonly offerId: string;
  /** The borrower who applied: the applicant of the file, the one who may sign the offer. */
  readonly applicantId: string;
  readonly staff: HttpClient;
}

/**
 * A borrower applies, the application is assessed and approved, the offer is drafted and issued to the borrower: the
 * offer the applicant may sign. The issue takes the clock of the spec, so the spec sets the day before it calls this.
 */
export async function issuedOfferOf(application: RunningApplication): Promise<IssuedOffer> {
  await publishPricing(application, 1_250);

  const { applicationId, applicant, customerId } = await submittedApplication(application);

  await readAccountsAndRegister(application, applicationId, applicant);
  await publishScoringVersion(application);

  const assessorId = await appointStaff(application, 'credit-analyst');

  expectStatus(
    await (await analystOf(application, assessorId)).post(`/applications/${applicationId}/assessment`, {}),
    201,
  );

  const advisor = await deciderOf(application, 'advisor');

  expectStatus(await advisor.post(`/applications/${applicationId}/decision`, conditionalApproval), 201);

  const staff = await analystOf(application, 'offer-clerk');
  const drafted = expectStatus(await staff.post(`/applications/${applicationId}/offer-draft`, {}), 201);
  const offerId = (drafted.body as { id: string }).id;

  expectStatus(await staff.get(`/offers/${offerId}/pre-contractual-sheet`), 200);
  expectStatus(await staff.post(`/applications/${applicationId}/offer`, {}), 204);

  return { applicationId, offerId, applicantId: customerId, staff };
}
