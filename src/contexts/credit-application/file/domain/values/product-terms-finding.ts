/** A limit of its product that a request breaks: the amount in cents or the duration in months, above its maximum or below its minimum. */
export type OutsideProductLimit = {
  readonly kind: 'outside-limit';
  readonly productId: string;
  readonly term: 'amount' | 'duration';
  readonly bound: 'maximum' | 'minimum';
  readonly requested: number;
  readonly limit: number;
};

/** The terms of the product are not kept yet: the check cannot compare the request with them. */
export type ProductTermsUnknownFinding = {
  readonly kind: 'terms-unknown';
  readonly productId: string;
};

/** What a check of an application against its product keeps in the file. */
export type ProductTermsFinding = OutsideProductLimit | ProductTermsUnknownFinding;
