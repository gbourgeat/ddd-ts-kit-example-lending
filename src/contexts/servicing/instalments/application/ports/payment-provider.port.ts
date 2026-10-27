export abstract class PaymentProvider {
  /** Collects one instalment by direct debit on the mandate of a loan; the answer says whether the debit was accepted. */
  abstract collectDirectDebit(mandateReference: string, amountInCents: number): Promise<{ readonly accepted: boolean }>;
}
