export interface GetCustomerDueDiligenceResult {
  readonly customerId: string;
  /** Absent while the customer was never refreshed, or when the asker's scope does not reach the customer. */
  readonly refreshedOn?: string;
  readonly nextDueOn?: string;
}
