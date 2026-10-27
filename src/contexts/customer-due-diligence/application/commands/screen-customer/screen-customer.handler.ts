import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import { UnknownCustomer } from '@/contexts/customer-due-diligence/domain/errors/unknown-customer.error';
import type { CustomerRepository } from '@/contexts/customer-due-diligence/domain/repositories/customer.repository';
import type { ScreeningProvider } from '@/contexts/customer-due-diligence/application/ports/screening-provider.port';
import type { ScreenCustomerCommand } from '@/contexts/customer-due-diligence/application/commands/screen-customer/screen-customer.command';

export class ScreenCustomerHandler implements CommandHandler<ScreenCustomerCommand> {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly screeningProvider: ScreeningProvider,
    private readonly clock: Clock,
  ) {}

  async execute(command: ScreenCustomerCommand): Promise<string> {
    const customer = await this.customerRepository.findById(command.customerId);

    if (customer === undefined) {
      throw UnknownCustomer.forCustomer(command.customerId);
    }

    const { possibleMatch } = await this.screeningProvider.screen(command.name, command.birthDate);

    if (possibleMatch) {
      customer.recordPossibleMatch(this.clock.now());
    }

    await this.customerRepository.save(customer);

    return customer.id;
  }
}
