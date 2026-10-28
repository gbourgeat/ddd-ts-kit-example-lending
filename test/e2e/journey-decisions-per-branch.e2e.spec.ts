import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { assignCustomerToAdvisorOnBranch } from '$test/e2e/support/credit-application/advisor-branch';
import {
  analystOf,
  publishScoringVersion,
  readAccountsAndRegister,
} from '$test/e2e/support/credit-application/assessed-application-world';
import {
  appointStaff,
  deciderOf,
  keepDecisionReads,
  publishDelegationTable,
} from '$test/e2e/support/credit-application/decision-world';
import { aPersonBody, operatorOf } from '$test/e2e/support/customer-due-diligence/customer-files';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';

const tenantId = 'acme-bank';
const YEAR_AND_MONTH_LENGTH = 7;

const borrowerBody = { ...aPersonBody('12AB34567'), name: 'Ada Lovelace', birthDate: '1980-05-01T00:00:00.000Z' };

const approval = { outcome: 'approve', reasons: '', conditions: '', approvedAmountCents: 0 };

const refusal = {
  outcome: 'refuse',
  reasons: 'The debt to income ratio is above the policy.',
  conditions: '',
  approvedAmountCents: 0,
};

describe('Count the decisions of each branch in the month, end to end', () => {
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  it('counts the decisions of a branch, and its approvals, in the month of their decision', async () => {
    const month = monthOf(new Date());
    const borrower = await borrowerOnBranch(application);

    await keepDecisionReads(application);
    await publishDelegationTable(application);
    await publishScoringVersion(application);

    const assessor = await analystOf(application, await appointStaff(application, 'credit-analyst'));
    const advisor = await deciderOf(application, 'advisor');
    const deciders = { application, borrower, assessor, advisor };

    await decideApplication(deciders, approval);
    await decideApplication(deciders, refusal);
    await application.settled();

    const rows = await decisionsPerBranch(application, borrower.branchId);

    expect(rows).toEqual([
      { branchId: borrower.branchId, month, decisionCount: 2, approvalCount: 1, exceptionCount: 0 },
    ]);
  });
});

interface Borrower {
  readonly customerId: string;
  readonly applicant: HttpClient;
  readonly branchId: string;
}

/** A borrower whose advisor, and so whose branch, is set before the application is submitted: the branch is kept on it. */
async function borrowerOnBranch(application: RunningApplication): Promise<Borrower> {
  const operator = await operatorOf(application, 'ada');
  const customerId = (expectStatus(await operator.post('/customers', borrowerBody), 201).body as { id: string }).id;
  const { branchId } = await assignCustomerToAdvisorOnBranch(application, customerId, tenantId);

  await application.relate({ object: `customer:${customerId}`, relation: 'self', subject: `user:${customerId}` });
  const applicant = await application.as({ id: customerId, tenantId });

  return { customerId, applicant, branchId };
}

interface Deciders {
  readonly application: RunningApplication;
  readonly borrower: Borrower;
  readonly assessor: HttpClient;
  readonly advisor: HttpClient;
}

/** The borrower submits an application, it is assessed and then decided: the decision is announced to the other contexts. */
async function decideApplication(deciders: Deciders, decision: object): Promise<void> {
  const { application, borrower, assessor, advisor } = deciders;
  const submitted = expectStatus(await borrower.applicant.post('/applications', applicationFor(1000)), 201);
  const applicationId = (submitted.body as { id: string }).id;

  await application.relate({
    object: `application:${applicationId}`,
    relation: 'customer',
    subject: `customer:${borrower.customerId}`,
  });

  await readAccountsAndRegister(application, applicationId, borrower.applicant);

  expectStatus(await assessor.post(`/applications/${applicationId}/assessment`, {}), 201);
  expectStatus(await advisor.post(`/applications/${applicationId}/decision`, decision), 201);
}

function applicationFor(cents: number) {
  return { productId: 'personal-loan', amount: { cents, currency: 'EUR' }, durationMonths: 60 };
}

/** The month of an instant in UTC, as the read model keys it: `YYYY-MM`. */
function monthOf(instant: Date): string {
  return instant.toISOString().slice(0, YEAR_AND_MONTH_LENGTH);
}

/** The rows of one branch of the tenant's decisions-per-branch read model, read from its table (the started application keeps no route for it yet). */
async function decisionsPerBranch(application: RunningApplication, branchId: string) {
  const rows = await application.persistence.database.client().reportingDecisionCount.findMany({
    where: { tenantId, branchId },
    orderBy: [{ month: 'asc' }],
  });

  return rows.map((row) => ({
    branchId: row.branchId,
    month: row.month,
    decisionCount: row.decisionCount,
    approvalCount: row.approvalCount,
    exceptionCount: row.exceptionCount,
  }));
}
