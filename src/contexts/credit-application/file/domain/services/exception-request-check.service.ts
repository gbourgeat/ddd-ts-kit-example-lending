import { CreditApplicationExceptionRequested } from '@/contexts/credit-application/file/domain/events/credit-application-exception-requested.event';
import { AlreadyDecided } from '@/contexts/credit-application/file/domain/errors/already-decided.error';
import { NotAssessed } from '@/contexts/credit-application/file/domain/errors/not-assessed.error';
import { ExceptionAlreadyRequested } from '@/contexts/credit-application/file/domain/errors/exception-already-requested.error';
import { InvalidExceptionJustification } from '@/contexts/credit-application/file/domain/errors/invalid-exception-justification.error';
import type { ExceptionRequest } from '@/contexts/credit-application/file/domain/values/exception-request';

/**
 * The checks of an exception requested on the application: it is assessed and not decided yet, no exception is already
 * requested on it, and the justification is written.
 */
export class ExceptionRequestCheckService {
  eventOf(
    aggregateId: string,
    file: {
      readonly decision: { readonly outcome: string } | undefined;
      readonly lastAssessment: { readonly proposedOutcome: string } | undefined;
      readonly exception: ExceptionRequest | undefined;
    },
    request: ExceptionRequest,
  ): CreditApplicationExceptionRequested {
    if (file.decision !== undefined) {
      throw AlreadyDecided.forAlreadyDecided();
    }

    if (file.lastAssessment === undefined) {
      throw NotAssessed.forNotAssessed();
    }

    if (file.exception !== undefined) {
      throw ExceptionAlreadyRequested.forExceptionAlreadyRequested();
    }

    if (request.justification.trim() === '') {
      throw InvalidExceptionJustification.forInvalidExceptionJustification();
    }

    return new CreditApplicationExceptionRequested(
      aggregateId,
      request.requestedAt,
      request.requesterId,
      request.targetLevel,
      request.justification,
    );
  }
}
