import { collectEvents, expectStatus } from '@ddd-ts-kit/testing/e2e';
import { customerAdvisorAssignedV1 } from '@/contexts/customer-due-diligence/published-language';
import type { RunningApplication } from '$test/e2e/support/start-application';

/** The branch the advisor was appointed on, and the advisor the customer was assigned to. */
export interface AdvisorOnBranch {
  readonly branchId: string;
  readonly advisorId: string;
}

const advisor = { name: 'Grace Hopper', email: 'grace@example.test' };

/**
 * Opens a branch, appoints an advisor on it, and assigns the customer to that advisor: the customer joins the
 * advisor's portfolio, which belongs to the branch. Settles each step, so that what it returns is in place.
 */
export async function assignCustomerToAdvisorOnBranch(
  application: RunningApplication,
  customerId: string,
  tenantId: string,
): Promise<AdvisorOnBranch> {
  await application.relate({ object: 'context:branch-network', relation: 'operator', subject: 'user:ada' });
  const ada = await application.as({ id: 'ada', tenantId });

  const opened = expectStatus(await ada.post('/branches', {}), 201);
  const { id: branchId } = opened.body as { id: string };

  const appointed = collectEvents(application.events, ['branch-network.staff-member.appointed']);

  expectStatus(await ada.post(`/branches/${branchId}/staff`, advisor), 201);
  await application.settled();
  appointed.stop();

  const [event] = appointed.received('branch-network.staff-member.appointed');
  const advisorId = (event as unknown as { payload: { staffMemberId: string } }).payload.staffMemberId;

  await application.publish([
    {
      ...customerAdvisorAssignedV1.create(
        { customerId, advisorId },
        { id: `advisor-assigned-${customerId}`, occurredAt: '2026-01-01T00:00:00.000Z' },
      ),
      tenantId,
    },
  ]);

  await application.settled();

  return { branchId, advisorId };
}
