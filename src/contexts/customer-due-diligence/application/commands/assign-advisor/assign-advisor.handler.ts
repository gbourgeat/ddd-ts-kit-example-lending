import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import { UnknownCustomer } from '@/contexts/customer-due-diligence/domain/errors/unknown-customer.error';
import type { CustomerRepository } from '@/contexts/customer-due-diligence/domain/repositories/customer.repository';
import type { AssignAdvisorCommand } from '@/contexts/customer-due-diligence/application/commands/assign-advisor/assign-advisor.command';

export class AssignAdvisorHandler implements CommandHandler<AssignAdvisorCommand> {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly clock: Clock,
  ) {}

  async execute(command: AssignAdvisorCommand): Promise<string> {
    const customer = await this.customerRepository.findById(command.customerId);

    if (customer === undefined) {
      throw UnknownCustomer.forCustomer(command.customerId);
    }

    customer.assignAdvisor(command.advisorId, this.clock.now());

    await this.customerRepository.save(customer);

    return customer.id;
  }
}
