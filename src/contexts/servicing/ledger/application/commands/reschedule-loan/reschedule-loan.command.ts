import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Reschedules the outstanding capital of the loan over a new duration, at its rate: the instalments noted due keep their record. */
export class RescheduleLoanCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly rescheduling: {
      readonly loanId: string;
      /** The event that decided the rescheduling: a decision already recorded is never recorded twice. */
      readonly decisionId: string;
      readonly capitalCents: number;
      readonly durationMonths: number;
    },
  ) {
    super(actor);
  }
}
