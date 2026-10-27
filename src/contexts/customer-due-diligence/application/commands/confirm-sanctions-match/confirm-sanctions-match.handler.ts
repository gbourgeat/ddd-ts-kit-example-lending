import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import { UnknownCustomer } from '@/contexts/customer-due-diligence/domain/errors/unknown-customer.error';
import type { CustomerRepository } from '@/contexts/customer-due-diligence/domain/repositories/customer.repository';
import type { ConfirmSanctionsMatchCommand } from '@/contexts/customer-due-diligence/application/commands/confirm-sanctions-match/confirm-sanctions-match.command';

export class ConfirmSanctionsMatchHandler implements CommandHandler<ConfirmSanctionsMatchCommand> {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly clock: Clock,
  ) {}

  async execute(command: ConfirmSanctionsMatchCommand): Promise<string> {
    const customer = await this.customerRepository.findById(command.customerId);

    if (customer === undefined) {
      throw UnknownCustomer.forCustomer(command.customerId);
    }

    customer.confirmSanctionsMatch(this.clock.now());

    await this.customerRepository.save(customer);

    return customer.id;
  }
}
