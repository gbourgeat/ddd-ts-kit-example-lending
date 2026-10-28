import type { LoanArrearsBucketEntered } from '@/contexts/servicing/arrears/domain/events/loan-arrears-bucket-entered.event';
import type { BorrowerNotifier } from '@/contexts/servicing/arrears/application/ports/borrower-notifier.port';
import { stageNoticeMessage } from '@/contexts/servicing/arrears/application/notices/stage-notice-message';
import type { LoanRepository } from '@/contexts/servicing/ledger/domain/repositories/loan.repository';

/**
 * Once a loan has entered an arrears bucket and that is committed, its borrower gets one notice for the stage, by mail
 * and by text message (the notifier covers both channels). The borrower's name is read for the notice only: never
 * logged, never stored. It runs after the commit: a failing notifier is reported by the dispatcher and does not undo
 * the classification. It saves nothing.
 */
export class NotifyBorrowerAtEachStageEventHandler {
  constructor(
    private readonly loanRepository: LoanRepository,
    private readonly borrowerNotifier: BorrowerNotifier,
  ) {}

  async handle(event: LoanArrearsBucketEntered): Promise<void> {
    const loan = await this.loanRepository.findById(event.aggregateId);
    const borrower = loan?.borrower;

    if (borrower === undefined) {
      return;
    }

    await this.borrowerNotifier.notify(borrower.name, stageNoticeMessage(event.bucket));
  }
}
