import { CreditApplicationExceptionDecided } from '@/contexts/credit-application/file/domain/events/credit-application-exception-decided.event';
import { AlreadyDecided } from '@/contexts/credit-application/file/domain/errors/already-decided.error';
import { ExceptionAlreadyDecided } from '@/contexts/credit-application/file/domain/errors/exception-already-decided.error';
import { InvalidDecisionReasons } from '@/contexts/credit-application/file/domain/errors/invalid-decision-reasons.error';
import { NoExceptionRequested } from '@/contexts/credit-application/file/domain/errors/no-exception-requested.error';
import type { ExceptionRequest } from '@/contexts/credit-application/file/domain/values/exception-request';
import type { CreditApplicationState } from '@/contexts/credit-application/file/domain/values/credit-application-state';
import type { DecisionOutcome } from '@/contexts/credit-application/decision/domain/vocabularies/decision-outcome.vocabulary';

/**
 * The checks of the committee's decision on an exception: the application is not decided, an exception is requested and
 * not decided yet, and its reasons are written. The outcome is approve or refuse, as the route gives it.
 */
export class ExceptionDecisionCheckService {
  eventOf(
    aggregateId: string,
    file: {
      readonly decision: { readonly outcome: string } | undefined;
      readonly exception: ExceptionRequest | undefined;
      readonly exceptionDecision: { readonly outcome: DecisionOutcome } | undefined;
    },
    decision: {
      readonly deciderId: string;
      readonly outcome: DecisionOutcome;
      readonly reasons: string;
      readonly decidedAt: Date;
    },
  ): CreditApplicationExceptionDecided {
    if (file.decision !== undefined) {
      throw AlreadyDecided.forAlreadyDecided();
    }

    if (file.exception === undefined) {
      throw NoExceptionRequested.forNoExceptionRequested();
    }

    if (file.exceptionDecision !== undefined) {
      throw ExceptionAlreadyDecided.forExceptionAlreadyDecided();
    }

    if (decision.reasons.trim() === '') {
      throw InvalidDecisionReasons.forReasons();
    }

    return new CreditApplicationExceptionDecided(
      aggregateId,
      decision.decidedAt,
      decision.outcome,
      decision.deciderId,
      decision.reasons,
    );
  }

  /** The field the decided exception sets on the file: its outcome and the committee member who decided it. */
  changesOf(event: CreditApplicationExceptionDecided): Pick<CreditApplicationState, 'exceptionDecision'> {
    return { exceptionDecision: { outcome: event.outcome, deciderId: event.deciderId } };
  }
}
