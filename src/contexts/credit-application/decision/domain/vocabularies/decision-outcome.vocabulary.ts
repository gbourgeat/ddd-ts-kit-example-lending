export const DecisionOutcome = {
  Approve: 'approve',
  ApproveWithConditions: 'approve-with-conditions',
  Refuse: 'refuse',
} as const;

export type DecisionOutcome = (typeof DecisionOutcome)[keyof typeof DecisionOutcome];
