import type { DelegationTablePublishedV2 } from '@/contexts/credit-policy/published-language';
import type { DelegationTableRow } from '@/contexts/credit-application/decision/application/ports/delegation-tables.port';

/** The row of the delegation tables read model that credit-policy's announcement describes. */
export function delegationTableRowOf(payload: DelegationTablePublishedV2['payload']): DelegationTableRow {
  return {
    delegationTableId: payload.delegationTableId,
    effectiveFrom: new Date(payload.effectiveFrom),
    levels: payload.levels.map((level) => ({ level: level.level, amountCents: level.amountCents })),
  };
}
