import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Opens an organisation; the account that opens it is its first owner. */
export class OpenOrganisationCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly organisation: { readonly slug: string; readonly name: string },
  ) {
    super(actor);
  }
}
