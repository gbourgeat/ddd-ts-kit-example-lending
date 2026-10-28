import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import type { LoanRepository } from '@/contexts/servicing/ledger/domain/repositories/loan.repository';
import { UnknownLoan } from '@/contexts/servicing/ledger/domain/errors/unknown-loan.error';
import type { RescheduleLoanCommand } from '@/contexts/servicing/ledger/application/commands/reschedule-loan/reschedule-loan.command';
import { Money } from '@/shared-kernel/money.vo';

export class RescheduleLoanHandler implements CommandHandler<RescheduleLoanCommand> {
  constructor(
    private readonly loanRepository: LoanRepository,
    private readonly clock: Clock,
  ) {}

  async execute(command: RescheduleLoanCommand): Promise<void> {
    const { rescheduling } = command;
    const loan = await this.loanRepository.findById(rescheduling.loanId);

    if (loan === undefined) {
      throw UnknownLoan.forLoan(rescheduling.loanId);
    }

    loan.reschedule(
      {
        id: rescheduling.decisionId,
        capital: Money.ofCents(rescheduling.capitalCents),
        durationMonths: rescheduling.durationMonths,
      },
      this.clock.now(),
    );

    await this.loanRepository.save(loan);
  }
}
