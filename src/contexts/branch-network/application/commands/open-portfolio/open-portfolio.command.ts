import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/**
 * Opens the empty portfolio of an advisor on a branch: the portfolio is born with them, so the use case is on the
 * context, not on an existing portfolio. A customer joins a portfolio later, by its own use case.
 */
export class OpenPortfolioCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly branchId: string,
    readonly advisorId: string,
  ) {
    super(actor);
  }
}
