import type { CommandHandler } from '@ddd-ts-kit/kernel';
import type { RequestPersonalDataCopyCommand } from '@/contexts/data-protection/application/commands/request-personal-data-copy/request-personal-data-copy.command';

export class RequestPersonalDataCopyHandler implements CommandHandler<RequestPersonalDataCopyCommand> {
  async execute(command: RequestPersonalDataCopyCommand): Promise<void> {
    // TODO(domain): receive the repository of the aggregate "request personal data copy" acts on in the constructor (rerun with --aggregate <Name> --force to get it wired), load or create the aggregate from `command`, call its intention method and save it (its events leave with the save); the unit of work is opened by the command bus.
  }
}
