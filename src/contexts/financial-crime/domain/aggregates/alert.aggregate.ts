import { AggregateRoot } from '@ddd-ts-kit/kernel';
import { AlertRaised } from '@/contexts/financial-crime/domain/events/alert-raised.event';
import { AlertAlreadyClosed } from '@/contexts/financial-crime/domain/errors/alert-already-closed.error';
import { ClosureReasonMissing } from '@/contexts/financial-crime/domain/errors/closure-reason-missing.error';

export interface AlertState {
  readonly registeredAt: Date;
  readonly repaymentReference: string;
  readonly closedAt?: Date | undefined;
  readonly closureReason?: string | undefined;
}

export class Alert extends AggregateRoot<string> {
  private constructor(
    id: string,
    private state: AlertState,
  ) {
    super(id);
  }

  static create(id: string, repaymentReference: string, now: Date): Alert {
    const created = new Alert(id, { registeredAt: now, repaymentReference });

    created.record(new AlertRaised(id, now));

    return created;
  }

  static rehydrate(id: string, state: AlertState): Alert {
    return new Alert(id, state);
  }

  /** Closes the alert with the reason the compliance officer gives: a closed alert is closed once, with a reason. */
  close(reason: string, now: Date): void {
    if (this.state.closedAt !== undefined) {
      throw AlertAlreadyClosed.forAlert();
    }

    if (reason.trim() === '') {
      throw ClosureReasonMissing.forAlert();
    }

    this.state = { ...this.state, closedAt: now, closureReason: reason };
  }

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  get repaymentReference(): string {
    return this.state.repaymentReference;
  }

  get closedAt(): Date | undefined {
    return this.state.closedAt;
  }

  get closureReason(): string | undefined {
    return this.state.closureReason;
  }

  toState(): AlertState {
    return { ...this.state };
  }
}
