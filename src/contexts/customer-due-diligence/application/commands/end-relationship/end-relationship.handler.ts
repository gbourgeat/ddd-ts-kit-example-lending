import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import { UnknownCustomer } from '@/contexts/customer-due-diligence/domain/errors/unknown-customer.error';
import type { CustomerRepository } from '@/contexts/customer-due-diligence/domain/repositories/customer.repository';
import type { EndRelationshipCommand } from '@/contexts/customer-due-diligence/application/commands/end-relationship/end-relationship.command';

export class EndRelationshipHandler implements CommandHandler<EndRelationshipCommand> {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly clock: Clock,
  ) {}

  async execute(command: EndRelationshipCommand): Promise<string> {
    const customer = await this.customerRepository.findById(command.customerId);

    if (customer === undefined) {
      throw UnknownCustomer.forCustomer(command.customerId);
    }

    customer.endRelationship(this.clock.now());

    await this.customerRepository.save(customer);

    return customer.id;
  }
}
