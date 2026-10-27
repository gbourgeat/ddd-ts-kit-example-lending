export const CreditPolicyCodes = {
  InvalidArrangementFee: 'INVALID_ARRANGEMENT_FEE',
  ProductBoundsInverted: 'PRODUCT_BOUNDS_INVERTED',
  InvalidScoreThreshold: 'INVALID_SCORE_THRESHOLD',
} as const;

export type CreditPolicyCode = (typeof CreditPolicyCodes)[keyof typeof CreditPolicyCodes];
