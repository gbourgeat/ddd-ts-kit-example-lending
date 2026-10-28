import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Compliance clears the possible match waiting for review on a customer, with its reason. */
export class DismissMatchCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly customerId: string,
    readonly reason: string,
  ) {
    super(actor);
  }
}
