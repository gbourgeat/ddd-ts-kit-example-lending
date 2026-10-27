import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Registers the business of a customer already known to the bank, with the facts of its registration. */
export class RegisterBusinessCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly customerId: string,
    readonly legalName: string,
    readonly registrationNumber: string,
    readonly countryOfRegistration: string,
    readonly registeredOn: Date,
  ) {
    super(actor);
  }
}
