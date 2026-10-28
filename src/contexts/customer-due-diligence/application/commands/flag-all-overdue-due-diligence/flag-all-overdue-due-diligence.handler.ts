import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import type { CustomerRepository } from '@/contexts/customer-due-diligence/domain/repositories/customer.repository';
import type { FlagAllOverdueDueDiligenceCommand } from '@/contexts/customer-due-diligence/application/commands/flag-all-overdue-due-diligence/flag-all-overdue-due-diligence.command';

export class FlagAllOverdueDueDiligenceHandler implements CommandHandler<FlagAllOverdueDueDiligenceCommand> {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly clock: Clock,
  ) {}

  /** Answers how many customers had a due diligence falling due before the instant. */
  async execute(command: FlagAllOverdueDueDiligenceCommand): Promise<number> {
    const dueCustomers = await this.customerRepository.findDueBefore(command.dueBefore);
    const now = this.clock.now();

    for (const customer of dueCustomers) {
      customer.flagOverdueDueDiligence(now);

      await this.customerRepository.save(customer);
    }

    return dueCustomers.length;
  }
}
