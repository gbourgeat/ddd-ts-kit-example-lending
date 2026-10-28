import type { StaffMemberAppointedV2 } from '@/contexts/branch-network/published-language';
import type { DeciderLevelRow } from '@/contexts/credit-application/decision/application/ports/decider-levels.port';

/**
 * The row of the decider levels read model that branch-network's appointment describes. The row is kept under the
 * account of the staff member, the actor of a decision, not under the identifier of the staff member.
 */
export function deciderLevelRowOf(payload: StaffMemberAppointedV2['payload']): DeciderLevelRow {
  return {
    staffMemberId: payload.accountId,
    branchId: payload.branchId,
    level: payload.level,
  };
}
