import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

export class DefineProductCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly terms: {
      readonly amountMinimumCents: number;
      readonly amountMaximumCents: number;
      readonly durationMinimumMonths: number;
      readonly durationMaximumMonths: number;
      readonly arrangementFeeCents: number;
      readonly insuranceMandatory: boolean;
      readonly scoreThreshold: number;
    },
  ) {
    super(actor);
  }
}
