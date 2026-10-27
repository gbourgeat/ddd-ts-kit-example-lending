import type { CommandHandler } from '@ddd-ts-kit/kernel';
import type { PersonalDataPurge } from '@/contexts/data-protection/application/ports/personal-data-purge.port';
import type { ErasePersonalDataPastRetentionCommand } from '@/contexts/data-protection/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';

/**
 * Asks every context to erase what outlived its retention: the purge of the platform reaches each
 * copy the contexts declared, and each erasure is audited by the copy. Answers the rows purged.
 */
export class ErasePersonalDataPastRetentionHandler implements CommandHandler<ErasePersonalDataPastRetentionCommand> {
  constructor(private readonly personalDataPurge: PersonalDataPurge) {}

  execute(_command: ErasePersonalDataPastRetentionCommand): Promise<number> {
    return this.personalDataPurge.purgeExpired();
  }
}
