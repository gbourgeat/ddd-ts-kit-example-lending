import { defineCriteria } from '@ddd-ts-kit/kernel';
import type { DeciderLevelRow } from '@/contexts/credit-application/decision/application/ports/decider-levels.port';

/** What a read of the decider levels read model may filter by. */
export const deciderLevelCriteria = defineCriteria<DeciderLevelRow>({
  fields: {
    staffMemberId: { type: 'string', filter: ['eq'] },
  },
  tieBreaker: 'staffMemberId',
});
