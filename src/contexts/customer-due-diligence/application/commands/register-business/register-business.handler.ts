import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import { UnknownCustomer } from '@/contexts/customer-due-diligence/domain/errors/unknown-customer.error';
import type { CustomerRepository } from '@/contexts/customer-due-diligence/domain/repositories/customer.repository';
import type { RegisterBusinessCommand } from '@/contexts/customer-due-diligence/application/commands/register-business/register-business.command';

export class RegisterBusinessHandler implements CommandHandler<RegisterBusinessCommand> {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly clock: Clock,
  ) {}

  async execute(command: RegisterBusinessCommand): Promise<string> {
    const customer = await this.customerRepository.findById(command.customerId);

    if (customer === undefined) {
      throw UnknownCustomer.forCustomer(command.customerId);
    }

    customer.registerBusiness(
      {
        legalName: command.legalName,
        registrationNumber: command.registrationNumber,
        countryOfRegistration: command.countryOfRegistration,
        registeredOn: command.registeredOn,
      },
      this.clock.now(),
    );

    await this.customerRepository.save(customer);

    return customer.id;
  }
}
