export const CreditPolicyCodes = {
  InvalidArrangementFee: 'INVALID_ARRANGEMENT_FEE',
  ProductBoundsInverted: 'PRODUCT_BOUNDS_INVERTED',
  InvalidScoreThreshold: 'INVALID_SCORE_THRESHOLD',
  InvalidLegalMaximumRate: 'INVALID_LEGAL_MAXIMUM_RATE',
  InvalidDelegationTable: 'INVALID_DELEGATION_TABLE',
  InvalidResidualIncomeMinimum: 'INVALID_RESIDUAL_INCOME_MINIMUM',
} as const;

export type CreditPolicyCode = (typeof CreditPolicyCodes)[keyof typeof CreditPolicyCodes];
