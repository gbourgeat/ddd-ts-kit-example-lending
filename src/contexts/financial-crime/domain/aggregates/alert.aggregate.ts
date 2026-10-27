import { AggregateRoot } from '@ddd-ts-kit/kernel';
import { AlertRaised } from '@/contexts/financial-crime/domain/events/alert-raised.event';

export interface AlertState {
  readonly registeredAt: Date;
  readonly repaymentReference: string;
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

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  get repaymentReference(): string {
    return this.state.repaymentReference;
  }

  toState(): AlertState {
    return { ...this.state };
  }
}
