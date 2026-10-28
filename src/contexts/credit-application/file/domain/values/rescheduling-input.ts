/** A rescheduling as the decider gives it: the new duration in months, the outstanding capital it reschedules, and the decider with the level and the instant. */
export interface ReschedulingInput {
  readonly deciderId: string;
  readonly level: string;
  readonly durationMonths: number;
  readonly outstandingAmountCents: number;
  readonly decidedAt: Date;
}
