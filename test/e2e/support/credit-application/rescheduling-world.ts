import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import type { RunningApplication } from '$test/e2e/support/start-application';
import {
  appointStaff,
  assessedApplicationBy,
  confirmRefusal,
  deciderOf,
} from '$test/e2e/support/credit-application/decision-world';

const approval = { outcome: 'approve', reasons: '', conditions: '', approvedAmountCents: 0 };
const refusal = { outcome: 'refuse', reasons: 'Confirmed by the review.', conditions: '', approvedAmountCents: 0 };

/** An application assessed by a credit analyst and approved by an advisor: the state a rescheduling starts from. */
export async function approvedApplicationOf(application: RunningApplication): Promise<string> {
  return approvedApplicationAssessedBy(application, await appointStaff(application, 'credit-analyst'));
}

/** An application assessed by the staff member given and approved by an advisor. */
export async function approvedApplicationAssessedBy(
  application: RunningApplication,
  assessorId: string,
): Promise<string> {
  const applicationId = await assessedApplicationBy(application, false, assessorId);
  const advisor = await deciderOf(application, 'advisor');

  expectStatus(await advisor.post(`/applications/${applicationId}/decision`, approval), 201);

  return applicationId;
}

/**
 * An application whose proposed refusal a second person confirmed, then refused by an advisor: not approved. The register
 * lists its applicant, which the reset of the database does not empty: a spec that runs it runs it last.
 */
export async function refusedApplicationOf(application: RunningApplication): Promise<string> {
  const assessorId = await appointStaff(application, 'credit-analyst');
  const applicationId = await assessedApplicationBy(application, true, assessorId);
  const reviewerId = await appointStaff(application, 'credit-analyst');

  await confirmRefusal(application, applicationId, reviewerId);

  const advisor = await deciderOf(application, 'advisor');

  expectStatus(await advisor.post(`/applications/${applicationId}/decision`, refusal), 201);

  return applicationId;
}
