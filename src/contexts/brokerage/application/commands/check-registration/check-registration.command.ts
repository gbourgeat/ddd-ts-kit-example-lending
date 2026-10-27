import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

// The daily check reads every broker of the bank: the command names no broker, and answers how many lapsed on the day.
// The day is the instant the work is for (the scheduled occurrence), never the instant the check really runs.
export class CheckRegistrationCommand extends AuthorizedCommand<number> {
  constructor(
    actor: Actor,
    readonly day: Date,
  ) {
    super(actor);
  }
}
