import type { CommandHandler } from '@ddd-ts-kit/kernel';
import type { ErasePersonalDataPastRetentionCommand } from '@/contexts/servicing/ledger/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';

export class ErasePersonalDataPastRetentionHandler implements CommandHandler<ErasePersonalDataPastRetentionCommand> {
  execute(): Promise<string> {
    // TODO(domain): US13.07 waits for the payout (US9.05) and the statement (US9.15): erase the data subjects of the loans closed ten years ago, through the erasure of the data subject of the kit, and answer the count.
    return Promise.resolve('0');
  }
}
