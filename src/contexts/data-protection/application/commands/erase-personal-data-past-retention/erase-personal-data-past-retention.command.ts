import { AuthorizedCommand } from '@ddd-ts-kit/kernel';

/** Asks every context to erase the personal data past their retention; answers the rows purged. */
export class ErasePersonalDataPastRetentionCommand extends AuthorizedCommand<number> {}
