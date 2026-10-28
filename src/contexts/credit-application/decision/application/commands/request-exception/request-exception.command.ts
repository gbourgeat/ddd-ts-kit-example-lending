import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** A decider asks for an exception to the policy on an application, with the justification in words: the level above decides it. */
export class RequestExceptionCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly applicationId: string,
    readonly justification: string,
  ) {
    super(actor);
  }
}
