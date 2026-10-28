import { DecisionAboveLimit } from '@/contexts/credit-application/decision/domain/errors/decision-above-limit.error';
import { PreparerCannotDecide } from '@/contexts/credit-application/decision/domain/errors/preparer-cannot-decide.error';

/** The level that bounds no decision: its deciders approve any amount. */
const CREDIT_COMMITTEE = 'credit-committee';

/**
 * The limit of the decider: the person who prepared the file never decides it, and the amount decided is within what the
 * decider's level may approve. A decision above it is refused, with the lowest level of the table that covers the amount.
 */
export class DecisionLimitService {
  check(decision: {
    readonly deciderId: string;
    readonly level: string;
    readonly amountCents: number;
    readonly levels: readonly { readonly level: string; readonly amountCents: number }[];
    readonly preparerIds: readonly string[];
  }): void {
    if (decision.preparerIds.includes(decision.deciderId)) {
      throw PreparerCannotDecide.forPreparerCannotDecide();
    }

    if (decision.level === CREDIT_COMMITTEE) {
      return;
    }

    const ceiling = decision.levels.find((limit) => limit.level === decision.level)?.amountCents ?? 0;

    if (decision.amountCents > ceiling) {
      throw DecisionAboveLimit.forAboveLimit(this.levelNeeded(decision.levels, decision.amountCents));
    }
  }

  private levelNeeded(levels: readonly { readonly level: string; readonly amountCents: number }[], amount: number) {
    const covering = [...levels]
      .sort((first, second) => first.amountCents - second.amountCents)
      .find((limit) => limit.amountCents >= amount);

    return covering?.level ?? CREDIT_COMMITTEE;
  }
}
