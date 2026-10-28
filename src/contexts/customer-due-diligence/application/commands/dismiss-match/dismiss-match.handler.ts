import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import { UnknownCustomer } from '@/contexts/customer-due-diligence/domain/errors/unknown-customer.error';
import type { CustomerRepository } from '@/contexts/customer-due-diligence/domain/repositories/customer.repository';
import type { DismissMatchCommand } from '@/contexts/customer-due-diligence/application/commands/dismiss-match/dismiss-match.command';

export class DismissMatchHandler implements CommandHandler<DismissMatchCommand> {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly clock: Clock,
  ) {}

  async execute(command: DismissMatchCommand): Promise<string> {
    const customer = await this.customerRepository.findById(command.customerId);

    if (customer === undefined) {
      throw UnknownCustomer.forCustomer(command.customerId);
    }

    customer.dismissMatch(command.reason, this.clock.now());

    await this.customerRepository.save(customer);

    return customer.id;
  }
}
