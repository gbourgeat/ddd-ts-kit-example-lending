import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import { UnknownCustomer } from '@/contexts/customer-due-diligence/domain/errors/unknown-customer.error';
import type { CustomerRepository } from '@/contexts/customer-due-diligence/domain/repositories/customer.repository';
import type { FlagOverdueDueDiligenceCommand } from '@/contexts/customer-due-diligence/application/commands/flag-overdue-due-diligence/flag-overdue-due-diligence.command';

export class FlagOverdueDueDiligenceHandler implements CommandHandler<FlagOverdueDueDiligenceCommand> {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly clock: Clock,
  ) {}

  async execute(command: FlagOverdueDueDiligenceCommand): Promise<string> {
    const customer = await this.customerRepository.findById(command.customerId);

    if (customer === undefined) {
      throw UnknownCustomer.forCustomer(command.customerId);
    }

    customer.flagOverdueDueDiligence(this.clock.now());

    await this.customerRepository.save(customer);

    return customer.id;
  }
}
