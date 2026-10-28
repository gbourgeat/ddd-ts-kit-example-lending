import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Compliance approves a customer rated high risk: refused unless the customer is rated high. */
export class ApproveHighRiskCustomerCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly customerId: string,
  ) {
    super(actor);
  }
}
