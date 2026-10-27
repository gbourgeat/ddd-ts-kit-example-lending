import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Screens a customer's person against the sanctions and politically exposed lists, with the name and birth date the caller gives. */
export class ScreenCustomerCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly customerId: string,
    readonly name: string,
    readonly birthDate: Date,
  ) {
    super(actor);
  }
}
