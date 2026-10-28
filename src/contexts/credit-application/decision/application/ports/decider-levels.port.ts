import { ReadModelStore } from '@ddd-ts-kit/kernel';

/** One line of the decider levels read model: the level a staff member was appointed to, as branch-network announces it. */
export type DeciderLevelRow = {
  readonly staffMemberId: string;
  readonly branchId: string;
  readonly level: string;
};

/** The decider levels read model, kept from what branch-network announces: one line per staff member. */
export abstract class DeciderLevels extends ReadModelStore<DeciderLevelRow> {}
