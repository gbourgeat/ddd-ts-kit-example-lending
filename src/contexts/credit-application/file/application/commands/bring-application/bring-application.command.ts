import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** The loan request a broker brings: the customer it is for, the product, the amount in cents and the duration in months. */
export interface BringRequest {
  readonly customerId: string;
  readonly productId: string;
  readonly amountInCents: number;
  readonly durationMonths: number;
}

/** A registered broker brings an application on behalf of a customer: the actor is the broker. */
export class BringApplicationCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly request: BringRequest,
  ) {
    super(actor);
  }
}
