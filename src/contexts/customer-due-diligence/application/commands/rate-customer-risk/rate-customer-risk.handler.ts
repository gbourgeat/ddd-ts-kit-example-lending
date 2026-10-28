import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import { UnknownCustomer } from '@/contexts/customer-due-diligence/domain/errors/unknown-customer.error';
import type { CustomerRepository } from '@/contexts/customer-due-diligence/domain/repositories/customer.repository';
import type { RateCustomerRiskCommand } from '@/contexts/customer-due-diligence/application/commands/rate-customer-risk/rate-customer-risk.command';

export class RateCustomerRiskHandler implements CommandHandler<RateCustomerRiskCommand> {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly clock: Clock,
  ) {}

  async execute(command: RateCustomerRiskCommand): Promise<string> {
    const customer = await this.customerRepository.findById(command.customerId);

    if (customer === undefined) {
      throw UnknownCustomer.forCustomer(command.customerId);
    }

    customer.rateRisk(command.rating, this.clock.now());

    await this.customerRepository.save(customer);

    return customer.id;
  }
}
