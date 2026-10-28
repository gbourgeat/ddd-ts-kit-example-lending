import type { CommandHandler } from '@ddd-ts-kit/kernel';
import type { LoanRepository } from '@/contexts/servicing/ledger/domain/repositories/loan.repository';
import type { RecordWithdrawalRepaymentCommand } from '@/contexts/servicing/ledger/application/commands/record-withdrawal-repayment/record-withdrawal-repayment.command';

export class RecordWithdrawalRepaymentHandler implements CommandHandler<RecordWithdrawalRepaymentCommand> {
  constructor(private readonly loanRepository: LoanRepository) {}

  /** Safe to repeat: a loan already closed has nothing left to repay, and a withdrawal before the payout finds no loan. */
  async execute(command: RecordWithdrawalRepaymentCommand): Promise<void> {
    const loan = await this.loanRepository.findById(command.withdrawal.loanId);

    if (loan === undefined) {
      return;
    }

    loan.repayOnWithdrawal(command.withdrawal.withdrawnAt);

    await this.loanRepository.save(loan);
  }
}
