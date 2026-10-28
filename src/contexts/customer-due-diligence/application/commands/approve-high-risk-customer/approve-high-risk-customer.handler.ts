import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import { UnknownCustomer } from '@/contexts/customer-due-diligence/domain/errors/unknown-customer.error';
import type { CustomerRepository } from '@/contexts/customer-due-diligence/domain/repositories/customer.repository';
import type { ApproveHighRiskCustomerCommand } from '@/contexts/customer-due-diligence/application/commands/approve-high-risk-customer/approve-high-risk-customer.command';

export class ApproveHighRiskCustomerHandler implements CommandHandler<ApproveHighRiskCustomerCommand> {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly clock: Clock,
  ) {}

  async execute(command: ApproveHighRiskCustomerCommand): Promise<string> {
    const customer = await this.customerRepository.findById(command.customerId);

    if (customer === undefined) {
      throw UnknownCustomer.forCustomer(command.customerId);
    }

    customer.approveHighRisk(this.clock.now());

    await this.customerRepository.save(customer);

    return customer.id;
  }
}
