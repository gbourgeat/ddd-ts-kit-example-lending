import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

// The resource of the use case is the context: a broker is not yet registered when the command is asked.
export class RegisterBrokerCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly registrationNumber: string,
  ) {
    super(actor);
  }
}
