import { collectEvents, expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { branchOperatorOf } from '$test/e2e/support/branch-network/branch-operator';
import { openedBranchOf } from '$test/e2e/support/branch-network/opened-branch';
import { operatorOf } from '$test/e2e/support/credit-policy/operator-of';
import type { RunningApplication } from '$test/e2e/support/start-application';
import {
  analystOf,
  applicationWithAccountsAndRegister,
  publishScoringVersion,
  readAccountsAndRegister,
  submittedApplication,
} from '$test/e2e/support/credit-application/assessed-application-world';

const birthDate = new Date('1980-05-01T00:00:00.000Z');
const staffMemberAppointed = 'branch-network.staff-member.appointed';

/** The system actors of credit-application that keep the levels and the tables: the reset of the database empties their relationships. */
const keepDeciderLevelSystemActor = 'system:system:credit-application.keep-decider-level';
const keepDelegationTableSystemActor = 'system:system:credit-application.keep-delegation-table';

let appointments = 0;

/** Gives back the lines of the system actors that keep the levels and the tables, emptied by the reset. */
export async function keepDecisionReads(application: RunningApplication): Promise<void> {
  await application.relate({
    object: 'context:credit-application',
    relation: 'keeper',
    subject: keepDeciderLevelSystemActor,
  });

  await application.relate({
    object: 'context:credit-application',
    relation: 'keeper',
    subject: keepDelegationTableSystemActor,
  });
}

/** credit-policy publishes the delegation table in force from 1 March 2026: the advisor's limit is given, the others are the bank's. */
export async function publishDelegationTable(
  application: RunningApplication,
  advisorLimitCents = 1_500_000,
): Promise<void> {
  const operator = await operatorOf(application, 'ada');

  expectStatus(
    await operator.put('/delegation-table', {
      effectiveFrom: '2026-03-01',
      advisorLimitCents,
      creditAnalystLimitCents: 7_500_000,
      riskManagerLimitCents: 25_000_000,
      creditCommitteeLimitCents: 100_000_000,
    }),
    200,
  );

  await application.settled();
}

/** Appoints a member of staff to the level on an opened branch, as branch-network does: returns the account they sign in with. */
export async function appointStaff(
  application: RunningApplication,
  level: string,
  accountId?: string,
): Promise<string> {
  const operator = await branchOperatorOf(application);
  const branchId = await openedBranchOf(operator);
  const published = collectEvents(application.events, [staffMemberAppointed]);

  appointments += 1;

  const account = accountId ?? `${level}-${appointments}`;

  expectStatus(
    await operator.post(`/branches/${branchId}/staff`, {
      name: `${level} ${appointments}`,
      email: `${account}@example.test`,
      accountId: account,
      level,
    }),
    201,
  );

  await application.settled();
  published.stop();

  const event = published.received(staffMemberAppointed).find((candidate) => candidate.version === 2);

  return (event?.payload as { accountId: string }).accountId;
}

/** A member of staff of the level, signed in as the staff member, who holds the permissions of the context. */
export async function deciderOf(application: RunningApplication, level: string): Promise<HttpClient> {
  return analystOf(application, await appointStaff(application, level));
}

/** An application assessed by the staff member given: the assessment proposes a refusal when the register lists the applicant. */
export async function assessedApplicationBy(
  application: RunningApplication,
  listed: boolean,
  assessorId: string,
): Promise<string> {
  if (listed) {
    application.incidents.record('Ada Lovelace', birthDate);
  }

  const applicationId = await applicationWithAccountsAndRegister(application);

  await publishScoringVersion(application);

  const assessor = await analystOf(application, assessorId);

  expectStatus(await assessor.post(`/applications/${applicationId}/assessment`, {}), 201);

  return applicationId;
}

/** A second person confirms the refusal the assessment proposed. */
export async function confirmRefusal(
  application: RunningApplication,
  applicationId: string,
  reviewerId: string,
): Promise<void> {
  const reviewer = await analystOf(application, reviewerId);
  const confirmation = { conclusion: 'confirm', reason: 'The register lists a homonym, not the applicant.' };

  expectStatus(await reviewer.post(`/applications/${applicationId}/refusal-review`, confirmation), 201);
}

/** A member of staff declares a conflict of interest on a customer, as the signed-in staff member of branch-network. */
export async function declareConflictAs(
  application: RunningApplication,
  accountId: string,
  customerId: string,
): Promise<void> {
  await application.relate({ object: 'context:branch-network', relation: 'operator', subject: `user:${accountId}` });
  const staff = await application.as({ id: accountId, tenantId: 'acme-bank' });

  expectStatus(await staff.post('/conflicts', { customerId }), 201);
  await application.settled();
}

/** A submitted application assessed by the staff member given, whose applicant is the customer returned with it. */
export async function assessedApplicationOfCustomer(
  application: RunningApplication,
  assessorId: string,
): Promise<{ applicationId: string; customerId: string }> {
  const { applicationId, applicant, customerId } = await submittedApplication(application);

  await readAccountsAndRegister(application, applicationId, applicant);
  await publishScoringVersion(application);

  const assessor = await analystOf(application, assessorId);

  expectStatus(await assessor.post(`/applications/${applicationId}/assessment`, {}), 201);

  return { applicationId, customerId };
}
