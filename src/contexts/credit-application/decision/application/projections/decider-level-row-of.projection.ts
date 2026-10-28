import type { StaffMemberAppointedV2 } from '@/contexts/branch-network/published-language';
import type { DeciderLevelRow } from '@/contexts/credit-application/decision/application/ports/decider-levels.port';

/** The row of the decider levels read model that branch-network's appointment describes. */
export function deciderLevelRowOf(payload: StaffMemberAppointedV2['payload']): DeciderLevelRow {
  return {
    staffMemberId: payload.staffMemberId,
    branchId: payload.branchId,
    level: payload.level,
  };
}
