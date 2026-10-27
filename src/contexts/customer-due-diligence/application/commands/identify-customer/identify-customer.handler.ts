import type { Clock, CommandHandler, IdGenerator } from '@ddd-ts-kit/kernel';
import { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import type { CustomerRepository } from '@/contexts/customer-due-diligence/domain/repositories/customer.repository';
import type { ScreeningProvider } from '@/contexts/customer-due-diligence/application/ports/screening-provider.port';
import type { IdentifyCustomerCommand } from '@/contexts/customer-due-diligence/application/commands/identify-customer/identify-customer.command';

/** Screens the person before it is identified; a possible match is recorded for compliance, and does not refuse the identification. */
export class IdentifyCustomerHandler implements CommandHandler<IdentifyCustomerCommand> {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
    private readonly screeningProvider: ScreeningProvider,
  ) {}

  async execute(command: IdentifyCustomerCommand): Promise<string> {
    const { possibleMatch } = await this.screeningProvider.screen(command.name, command.birthDate);
    const now = this.clock.now();

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
      now,
    );

    if (possibleMatch) {
      customer.recordPossibleMatch(now);
    }

    await this.customerRepository.save(customer);

    return customer.id;
  }
}
