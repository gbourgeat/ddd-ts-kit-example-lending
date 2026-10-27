import type { Clock, CommandHandler, IdGenerator } from '@ddd-ts-kit/kernel';
import { Money } from '@/shared-kernel/money.vo';
import { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { InvalidAmount } from '@/contexts/credit-application/file/domain/errors/invalid-amount.error';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import type { SubmitApplicationCommand } from '@/contexts/credit-application/file/application/commands/submit-application/submit-application.command';

export class SubmitApplicationHandler implements CommandHandler<SubmitApplicationCommand> {
  constructor(
    private readonly creditApplicationRepository: CreditApplicationRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(command: SubmitApplicationCommand): Promise<string> {
    const creditApplication = CreditApplication.create(this.ids.next(), command.actor.id, {
      amount: this.amountOf(command.amountInCents),
      durationMonths: command.durationMonths,
      registeredAt: this.clock.now(),
    });

    await this.creditApplicationRepository.save(creditApplication);

    return creditApplication.id;
  }

  /** A requested amount that is not whole cents is refused here, before Money would refuse it as a fault. */
  private amountOf(cents: number): Money {
    if (!Number.isSafeInteger(cents)) {
      throw InvalidAmount.forCents(cents);
    }

    return Money.ofCents(cents);
  }
}
