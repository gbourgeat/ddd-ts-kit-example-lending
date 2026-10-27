import type { Clock, CommandHandler, IdGenerator } from '@ddd-ts-kit/kernel';
import { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import type { CustomerRepository } from '@/contexts/customer-due-diligence/domain/repositories/customer.repository';
import type { IdentifyCustomerCommand } from '@/contexts/customer-due-diligence/application/commands/identify-customer/identify-customer.command';

export class IdentifyCustomerHandler implements CommandHandler<IdentifyCustomerCommand> {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(command: IdentifyCustomerCommand): Promise<string> {
    const customer = Customer.create(
      this.ids.next(),
      {
        documentKind: command.documentKind,
        documentNumber: command.documentNumber,
        issuingCountry: command.issuingCountry,
        documentExpiresOn: command.documentExpiresOn,
        address: command.address,
        addressProofDatedOn: command.addressProofDatedOn,
      },
      this.clock.now(),
    );

    await this.customerRepository.save(customer);

    return customer.id;
  }
}
