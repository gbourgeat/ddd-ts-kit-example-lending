import type { RelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import { Loan } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';
import type { LoanRepository } from '@/contexts/servicing/ledger/domain/repositories/loan.repository';
import { Borrower } from '@/contexts/servicing/ledger/domain/value-objects/borrower.vo';
import { LoanSchedule } from '@/contexts/servicing/ledger/domain/value-objects/loan-schedule.vo';
import type { RecordPayoutCommand } from '@/contexts/servicing/ledger/application/commands/record-payout/record-payout.command';
import { Money } from '@/shared-kernel/money.vo';

/** The postal address is not in the payout: it is kept empty until the offer carries it. */
const NO_POSTAL_ADDRESS = '';

/**
 * Records the payout: gives birth to the loan of the application, paid out now, with its schedule. A repeated payout
 * finds the loan and records nothing: one loan per application.
 */
export class RecordPayoutHandler implements CommandHandler<RecordPayoutCommand> {
  constructor(
    private readonly loanRepository: LoanRepository,
    private readonly dependencies: { readonly clock: Clock; readonly relations: RelationTupleStore },
  ) {}

  async execute(command: RecordPayoutCommand): Promise<string> {
    const { loanId } = command.payout;
    const existing = await this.loanRepository.findById(loanId);

    if (existing !== undefined) {
      return existing.id;
    }

    await this.linkToApplication(loanId);

    const loan = Loan.create(loanId, {
      paidOutAt: this.dependencies.clock.now(),
      borrower: Borrower.create(command.payout.borrowerName, NO_POSTAL_ADDRESS),
      schedule: LoanSchedule.of(
        Money.ofCents(command.payout.amountCents),
        command.payout.annualRateBasisPoints,
        command.payout.durationMonths,
      ),
    });

    await this.loanRepository.save(loan);

    return loan.id;
  }

  /** The loan belongs to its application: the borrower who reads the application reads its loan (`loan.read`). */
  private async linkToApplication(loanId: string): Promise<void> {
    await this.dependencies.relations.write([
      { object: `loan:${loanId}`, relation: 'application', subject: `application:${loanId}` },
    ]);
  }
}
