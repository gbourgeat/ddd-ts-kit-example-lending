import { AuthorizedCommand } from '@ddd-ts-kit/kernel';

/** Deactivates the account of the person who asks. */
export class DeactivateAccountCommand extends AuthorizedCommand<string> {}
