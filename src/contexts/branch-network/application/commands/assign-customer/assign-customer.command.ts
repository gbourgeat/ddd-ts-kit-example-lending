import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/**
 * Joins a customer to the portfolio of an advisor. The portfolio is found through the advisor, the staff member it
 * was opened for; the use case is on the context, as the membership is a relation of the portfolio.
 */
export class AssignCustomerCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly advisorId: string,
    readonly customerId: string,
  ) {
    super(actor);
  }
}
