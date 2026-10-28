import type { CommandHandler } from '@ddd-ts-kit/kernel';
import type { ErasePersonalDataPastRetentionCommand } from '@/contexts/credit-application/file/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';

export class ErasePersonalDataPastRetentionHandler implements CommandHandler<ErasePersonalDataPastRetentionCommand> {
  execute(): Promise<string> {
    // TODO(domain): US13.06 waits for the refusal of an application (US7.04): erase the data subjects of the applications refused six months ago, through the erasure of the data subject of the kit, and answer the count.
    return Promise.resolve('0');
  }
}
