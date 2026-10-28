import { expiredBefore, type CommandHandler, type FileStorage, type RetentionPeriod } from '@ddd-ts-kit/kernel';
import type { ErasePersonalDataPastRetentionCommand } from '@/contexts/credit-application/file/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';

/**
 * How long the personal data of a refused application is kept after the refusal: six months. Not yet an entry of
 * `RETENTION_PERIODS` (owned by data-protection): until one exists, the period is written here.
 */
const REFUSAL_RETENTION: RetentionPeriod = { months: 6 };

/**
 * Erases the personal values of the applications refused past their retention: the account information read for the
 * file (the income and expenses of the applicant), kept in the object store. The file keeps the reference, never the figures.
 */
export class ErasePersonalDataPastRetentionHandler implements CommandHandler<ErasePersonalDataPastRetentionCommand> {
  constructor(
    private readonly creditApplicationRepository: CreditApplicationRepository,
    private readonly storage: FileStorage,
  ) {}

  /** Answers how many documents it erased. */
  async execute(command: ErasePersonalDataPastRetentionCommand): Promise<string> {
    const cutoff = expiredBefore(REFUSAL_RETENTION, command.asOf);
    const refused = await this.creditApplicationRepository.findRefusedOnOrBefore(cutoff);
    let erased = 0;

    for (const application of refused) {
      for (const key of application.documentKeys) {
        await this.storage.delete(key);
        erased += 1;
      }
    }

    return String(erased);
  }
}
