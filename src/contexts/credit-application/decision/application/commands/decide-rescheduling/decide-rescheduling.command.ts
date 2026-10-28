import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** A staff member decides the rescheduling of an approved application: the new duration in months, and the outstanding capital it reschedules. */
export class DecideReschedulingCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly applicationId: string,
    readonly durationMonths: number,
    readonly outstandingAmountCents: number,
  ) {
    super(actor);
  }
}
