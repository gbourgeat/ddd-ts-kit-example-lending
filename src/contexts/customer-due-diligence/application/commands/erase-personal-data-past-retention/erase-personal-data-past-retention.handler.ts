import { expiredBefore, type CommandHandler, type RetentionPeriod } from '@ddd-ts-kit/kernel';
import type { PersonalDataErasure } from '@/contexts/customer-due-diligence/application/ports/personal-data-erasure.port';
import type { ErasePersonalDataPastRetentionCommand } from '@/contexts/customer-due-diligence/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';
import type { CustomerRepository } from '@/contexts/customer-due-diligence/domain/repositories/customer.repository';

/**
 * How long the personal data of a customer is kept after its relationship ends: five years. Not yet an entry of
 * `RETENTION_PERIODS` (owned by data-protection): until one exists, the period is written here.
 */
const CUSTOMER_RETENTION: RetentionPeriod = { years: 5 };

export class ErasePersonalDataPastRetentionHandler implements CommandHandler<ErasePersonalDataPastRetentionCommand> {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly personalDataErasure: PersonalDataErasure,
  ) {}

  async execute(command: ErasePersonalDataPastRetentionCommand): Promise<void> {
    const cutoff = expiredBefore(CUSTOMER_RETENTION, command.asOf);
    const pastRetention = await this.customerRepository.findEndedOnOrBefore(cutoff);

    for (const customer of pastRetention) {
      await this.personalDataErasure.erase(customer.id);
    }
  }
}
