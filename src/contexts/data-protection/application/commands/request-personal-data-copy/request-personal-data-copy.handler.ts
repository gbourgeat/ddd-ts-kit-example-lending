import type { CommandHandler, SignedUrl } from '@ddd-ts-kit/kernel';
import type { PersonalDataGathering } from '@/contexts/data-protection/application/ports/personal-data-gathering.port';
import type { CopyOfDataStore } from '@/contexts/data-protection/application/ports/copy-of-data-store.port';
import type { RequestPersonalDataCopyCommand } from '@/contexts/data-protection/application/commands/request-personal-data-copy/request-personal-data-copy.command';

/**
 * Gathers what every context keeps of the data subject, stores the copy as one document and answers
 * the link that downloads it. Nothing is written to the database: the copy lives in the object store
 * until the link expires.
 */
export class RequestPersonalDataCopyHandler implements CommandHandler<RequestPersonalDataCopyCommand> {
  constructor(
    private readonly gathering: PersonalDataGathering,
    private readonly copies: CopyOfDataStore,
  ) {}

  async execute(command: RequestPersonalDataCopyCommand): Promise<SignedUrl> {
    const document = await this.gathering.gather(command.customerId, command.actor.id);

    return this.copies.store(document);
  }
}
