import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import type { LoanRepository } from '@/contexts/servicing/ledger/domain/repositories/loan.repository';
import { UnknownLoan } from '@/contexts/servicing/ledger/domain/errors/unknown-loan.error';
import type { ReverseWriteOffCommand } from '@/contexts/servicing/ledger/application/commands/reverse-write-off/reverse-write-off.command';

export class ReverseWriteOffHandler implements CommandHandler<ReverseWriteOffCommand> {
  constructor(
    private readonly loanRepository: LoanRepository,
    private readonly clock: Clock,
  ) {}

  async execute(command: ReverseWriteOffCommand): Promise<void> {
    const loan = await this.loanRepository.findById(command.loanId);

    if (loan === undefined) {
      throw UnknownLoan.forLoan(command.loanId);
    }

    loan.reverseWriteOff(this.clock.now());

    await this.loanRepository.save(loan);
  }
}
