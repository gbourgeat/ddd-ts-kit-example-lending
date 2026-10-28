export interface GetCustomerDueDiligenceResult {
  readonly customerId: string;
  /** Absent while the customer was never refreshed, or when the asker's scope does not reach the customer. */
  readonly refreshedOn?: string;
  readonly nextDueOn?: string;
  /** The day the due diligence was flagged overdue, absent while it is current, or never flagged, or when the asker's scope does not reach the customer. */
  readonly flaggedOverdueOn?: string;
}
