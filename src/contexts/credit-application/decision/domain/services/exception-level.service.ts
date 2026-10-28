import { ConflictedDecider } from '@/contexts/credit-application/decision/domain/errors/conflicted-decider.error';
import { ExceptionNotAboveLimit } from '@/contexts/credit-application/decision/domain/errors/exception-not-above-limit.error';
import { PreparerCannotDecide } from '@/contexts/credit-application/decision/domain/errors/preparer-cannot-decide.error';

/** The level that bounds no decision: its deciders approve any amount. */
const CREDIT_COMMITTEE = 'credit-committee';

/** An exception goes to a risk manager at least. */
const RISK_MANAGER = 'risk-manager';

/** One level of a delegation table, as the decider limits give it. */
export interface ExceptionLevelOfTable {
  readonly level: string;
  readonly amountCents: number;
}

/**
 * The level an exception to the policy goes to: the level above the one the amount needs, and at least a risk manager. The
 * person who prepared the file and a person who declared a conflict on the applicant cannot ask for it, and an amount the
 * limit of the decider already covers needs no exception.
 */
export class ExceptionLevelService {
  of(request: {
    readonly deciderId: string;
    readonly level: string;
    readonly amountCents: number;
    readonly levels: readonly ExceptionLevelOfTable[];
    readonly preparerIds: readonly string[];
    readonly conflictedIds: readonly string[];
  }): string {
    if (request.preparerIds.includes(request.deciderId)) {
      throw PreparerCannotDecide.forPreparerCannotDecide();
    }

    if (request.conflictedIds.includes(request.deciderId)) {
      throw ConflictedDecider.forConflictedDecider();
    }

    const ceiling = request.levels.find((limit) => limit.level === request.level)?.amountCents ?? 0;

    if (request.level === CREDIT_COMMITTEE || request.amountCents <= ceiling) {
      throw ExceptionNotAboveLimit.forExceptionNotAboveLimit(request.level);
    }

    return this.levelAbove(request.levels, request.amountCents);
  }

  /** The level above the lowest one covering the amount, the committee when none covers it, and never under a risk manager. */
  private levelAbove(levels: readonly ExceptionLevelOfTable[], amountCents: number): string {
    const ordered = [...levels].sort((first, second) => first.amountCents - second.amountCents);
    const covering = ordered.findIndex((limit) => limit.amountCents >= amountCents);
    const neededIndex = covering === -1 ? ordered.length - 1 : covering;
    const aboveIndex = Math.min(neededIndex + 1, ordered.length - 1);
    const riskManagerIndex = ordered.findIndex((limit) => limit.level === RISK_MANAGER);
    const targetIndex = Math.max(aboveIndex, riskManagerIndex);

    return ordered[targetIndex]?.level ?? CREDIT_COMMITTEE;
  }
}
