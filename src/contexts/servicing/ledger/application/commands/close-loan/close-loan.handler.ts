import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import type { LoanRepository } from '@/contexts/servicing/ledger/domain/repositories/loan.repository';
import { UnknownLoan } from '@/contexts/servicing/ledger/domain/errors/unknown-loan.error';
import type { CloseLoanCommand } from '@/contexts/servicing/ledger/application/commands/close-loan/close-loan.command';

export class CloseLoanHandler implements CommandHandler<CloseLoanCommand> {
  constructor(
    private readonly loanRepository: LoanRepository,
    private readonly clock: Clock,
  ) {}

  async execute(command: CloseLoanCommand): Promise<void> {
    const loan = await this.loanRepository.findById(command.loanId);

    if (loan === undefined) {
      throw UnknownLoan.forLoan(command.loanId);
    }

    loan.close(this.clock.now());

    await this.loanRepository.save(loan);
  }
}
