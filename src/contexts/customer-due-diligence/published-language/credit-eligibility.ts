/** Whether a customer may be lent to on a day, and the reason when not. */
export type CreditEligibility =
  | { readonly eligible: true }
  | {
      readonly eligible: false;
      readonly reason:
        | 'unknown-customer'
        | 'relationship-ended'
        | 'sanctions-match'
        | 'high-risk-not-approved'
        | 'due-diligence-overdue';
    };
