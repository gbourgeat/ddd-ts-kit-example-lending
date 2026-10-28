import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import type { LoanRepository } from '@/contexts/servicing/ledger/domain/repositories/loan.repository';
import { UnknownLoan } from '@/contexts/servicing/ledger/domain/errors/unknown-loan.error';
import type { WriteOffLoanCommand } from '@/contexts/servicing/ledger/application/commands/write-off-loan/write-off-loan.command';

export class WriteOffLoanHandler implements CommandHandler<WriteOffLoanCommand> {
  constructor(
    private readonly loanRepository: LoanRepository,
    private readonly clock: Clock,
  ) {}

  async execute(command: WriteOffLoanCommand): Promise<void> {
    const loan = await this.loanRepository.findById(command.loanId);

    if (loan === undefined) {
      throw UnknownLoan.forLoan(command.loanId);
    }

    loan.writeOff(this.clock.now());

    await this.loanRepository.save(loan);
  }
}
