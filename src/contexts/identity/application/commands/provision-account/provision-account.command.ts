import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Provisions the account of the person who signs in, from what their token says of them, or refreshes it at a later sign-in. */
export class ProvisionAccountCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly profile: { readonly email: string; readonly emailVerified: boolean; readonly displayName: string },
  ) {
    super(actor);
  }
}
