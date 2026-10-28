import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import { UnknownCustomer } from '@/contexts/customer-due-diligence/domain/errors/unknown-customer.error';
import type { CustomerRepository } from '@/contexts/customer-due-diligence/domain/repositories/customer.repository';
import type { ScreeningProvider } from '@/contexts/customer-due-diligence/application/ports/screening-provider.port';
import type { RefreshDueDiligenceCommand } from '@/contexts/customer-due-diligence/application/commands/refresh-due-diligence/refresh-due-diligence.command';

export class RefreshDueDiligenceHandler implements CommandHandler<RefreshDueDiligenceCommand> {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly screeningProvider: ScreeningProvider,
    private readonly clock: Clock,
  ) {}

  async execute(command: RefreshDueDiligenceCommand): Promise<string> {
    const customer = await this.customerRepository.findById(command.customerId);

    if (customer === undefined) {
      throw UnknownCustomer.forCustomer(command.customerId);
    }

    const { possibleMatch } = await this.screeningProvider.screen(command.name, command.birthDate);

    customer.refreshDueDiligence(possibleMatch, this.clock.now());

    await this.customerRepository.save(customer);

    return customer.id;
  }
}
