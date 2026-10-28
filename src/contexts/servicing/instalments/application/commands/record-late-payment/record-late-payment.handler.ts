import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import type { LoanRepository } from '@/contexts/servicing/ledger/domain/repositories/loan.repository';
import { UnknownLoan } from '@/contexts/servicing/ledger/domain/errors/unknown-loan.error';
import { Money } from '@/shared-kernel/money.vo';
import type { RecordLatePaymentCommand } from '@/contexts/servicing/instalments/application/commands/record-late-payment/record-late-payment.command';

export class RecordLatePaymentHandler implements CommandHandler<RecordLatePaymentCommand> {
  constructor(
    private readonly loanRepository: LoanRepository,
    private readonly clock: Clock,
  ) {}

  async execute(command: RecordLatePaymentCommand): Promise<void> {
    const loan = await this.loanRepository.findById(command.loanId);

    if (loan === undefined) {
      throw UnknownLoan.forLoan(command.loanId);
    }

    loan.recordLatePayment(command.payment.number, Money.ofCents(command.payment.amountCents), this.clock.now());

    await this.loanRepository.save(loan);
  }
}
