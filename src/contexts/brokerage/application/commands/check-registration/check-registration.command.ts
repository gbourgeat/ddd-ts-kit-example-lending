import { AuthorizedCommand } from '@ddd-ts-kit/kernel';

// The daily check reads every broker of the bank: the command names no broker, and answers how many lapsed on the day.
export class CheckRegistrationCommand extends AuthorizedCommand<number> {}
