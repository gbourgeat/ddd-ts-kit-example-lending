import { AuthorizedCommand } from '@ddd-ts-kit/kernel';

/** Opens a branch of the bank: the branch does not exist yet, so the use case is on the context. */
export class OpenBranchCommand extends AuthorizedCommand<string> {}
