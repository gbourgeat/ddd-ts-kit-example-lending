import { CreditApplicationContested } from '@/contexts/credit-application/file/domain/events/credit-application-contested.event';
import { ContestAlreadyRecorded } from '@/contexts/credit-application/file/domain/errors/contest-already-recorded.error';
import { ContestNotDecided } from '@/contexts/credit-application/file/domain/errors/contest-not-decided.error';
import type { CreditApplicationState } from '@/contexts/credit-application/file/domain/values/credit-application-state';

/** The checks of a contestation: the application is decided, and its decision is contested once. */
export class ContestCheckService {
  eventOf(
    aggregateId: string,
    file: {
      readonly decision: { readonly outcome: string } | undefined;
      readonly contestation: { readonly requesterId: string } | undefined;
    },
    contest: { readonly requesterId: string; readonly reason: string; readonly contestedAt: Date },
  ): CreditApplicationContested {
    if (file.decision === undefined) {
      throw ContestNotDecided.forContestNotDecided();
    }

    if (file.contestation !== undefined) {
      throw ContestAlreadyRecorded.forContestAlreadyRecorded();
    }

    return new CreditApplicationContested(aggregateId, contest.contestedAt, contest.requesterId, contest.reason);
  }

  /** The fields the contestation sets on the file: it is kept, and a person reviews the file unless one already does. */
  changesOf(
    event: CreditApplicationContested,
    file: CreditApplicationState,
  ): Pick<CreditApplicationState, 'contestation' | 'humanReview'> {
    return {
      contestation: { requesterId: event.requesterId, contestedAt: event.occurredAt, reason: event.reason },
      humanReview: file.humanReview ?? { requesterId: event.requesterId, requestedAt: event.occurredAt },
    };
  }
}
