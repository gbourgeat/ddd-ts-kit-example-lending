/** Answers the name of the borrower of a loan: customer-due-diligence holds it, the payout never carries it. Undefined when the customer is not identified. */
export abstract class BorrowerIdentity {
  abstract nameOf(customerId: string): Promise<string | undefined>;
}
