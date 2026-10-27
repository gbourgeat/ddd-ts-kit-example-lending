import { EventSourcedAggregate, type AggregateHistory, type Appliers } from '@ddd-ts-kit/kernel';
import { CustomerIdentified } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';

export type CustomerEvent = CustomerIdentified;

export interface CustomerState {
  readonly registeredAt: Date;
}

export class Customer extends EventSourcedAggregate<CustomerEvent, CustomerState> {
  private state: CustomerState = { registeredAt: new Date(0) };

  private constructor(id: string) {
    super(id);
  }

  static create(id: string, now: Date): Customer {
    const created = new Customer(id);

    created.record(new CustomerIdentified(id, now));

    return created;
  }

  static rehydrate(id: string, history: AggregateHistory<CustomerEvent, CustomerState>): Customer {
    const loaded = new Customer(id);

    return loaded.replay(history, (state) => loaded.restore(state));
  }

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  toState(): CustomerState {
    return { ...this.state };
  }

  protected appliers(): Appliers<CustomerEvent> {
    return {
      [CustomerIdentified.eventName]: (event) => this.applyIdentified(event),
    };
  }

  private restore(state: CustomerState): void {
    this.state = state;
  }

  private applyIdentified(event: CustomerIdentified): void {
    this.state = { ...this.state, registeredAt: event.occurredAt };
  }
}
