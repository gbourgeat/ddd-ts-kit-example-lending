import type { PersonalDataErasure } from '@/contexts/customer-due-diligence/application/ports/personal-data-erasure.port';
import { ErasePersonalDataPastRetentionCommand } from '@/contexts/customer-due-diligence/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';
import { ErasePersonalDataPastRetentionHandler } from '@/contexts/customer-due-diligence/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.handler';
import type { CustomerRepository } from '@/contexts/customer-due-diligence/domain/repositories/customer.repository';
import type { Platform } from '@/platform/composition/platform';

/** Registers the erasure of the personal data past retention, with the erasure the module bound. */
export function registerPersonalDataErasure(
  platform: Platform,
  customerRepository: CustomerRepository,
  personalDataErasure: PersonalDataErasure,
): void {
  platform.commands.register(
    ErasePersonalDataPastRetentionCommand,
    new ErasePersonalDataPastRetentionHandler(customerRepository, personalDataErasure),
    { context: 'customer-due-diligence' },
  );
}
