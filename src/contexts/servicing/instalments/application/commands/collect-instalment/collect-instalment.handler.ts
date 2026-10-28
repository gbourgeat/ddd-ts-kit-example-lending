import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import type { LoanRepository } from '@/contexts/servicing/ledger/domain/repositories/loan.repository';
import { UnknownLoan } from '@/contexts/servicing/ledger/domain/errors/unknown-loan.error';
import type { PaymentProvider } from '@/contexts/servicing/instalments/application/ports/payment-provider.port';
import type { CollectInstalmentCommand } from '@/contexts/servicing/instalments/application/commands/collect-instalment/collect-instalment.command';
import { Money } from '@/shared-kernel/money.vo';

export class CollectInstalmentHandler implements CommandHandler<CollectInstalmentCommand> {
  constructor(
    private readonly loanRepository: LoanRepository,
    private readonly paymentProvider: PaymentProvider,
    private readonly clock: Clock,
  ) {}

  async execute(command: CollectInstalmentCommand): Promise<void> {
    const loan = await this.loanRepository.findById(command.loanId);

    if (loan === undefined) {
      throw UnknownLoan.forLoan(command.loanId);
    }

    const { number, amountCents } = command.instalment;

    // An instalment not due, or already settled, is never debited again: the debit is asked for once.
    if (!loan.isCollectable(number)) {
      return;
    }

    const { accepted } = await this.paymentProvider.collectDirectDebit(loan.id, amountCents);
    const now = this.clock.now();

    if (accepted) {
      loan.recordPayment(number, Money.ofCents(amountCents), now);
    } else {
      loan.markUnpaid(number, now);
    }

    await this.loanRepository.save(loan);
  }
}
