import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import type { LoanRepository } from '@/contexts/servicing/ledger/domain/repositories/loan.repository';
import { UnknownLoan } from '@/contexts/servicing/ledger/domain/errors/unknown-loan.error';
import type { RepayEarlyCommand } from '@/contexts/servicing/ledger/application/commands/repay-early/repay-early.command';
import { Money } from '@/shared-kernel/money.vo';

export class RepayEarlyHandler implements CommandHandler<RepayEarlyCommand> {
  constructor(
    private readonly loanRepository: LoanRepository,
    private readonly clock: Clock,
  ) {}

  async execute(command: RepayEarlyCommand): Promise<void> {
    const loan = await this.loanRepository.findById(command.loanId);

    if (loan === undefined) {
      throw UnknownLoan.forLoan(command.loanId);
    }

    loan.repayEarly(Money.ofCents(command.capitalCents), this.clock.now());

    await this.loanRepository.save(loan);
  }
}
