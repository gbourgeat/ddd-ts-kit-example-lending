import { AggregateRoot } from '@ddd-ts-kit/kernel';
import { BrokerRegistered } from '@/contexts/brokerage/domain/events/broker-registered.event';

export interface BrokerState {
  readonly registeredAt: Date;
  readonly registrationNumber: string;
}

export class Broker extends AggregateRoot<string> {
  private constructor(
    id: string,
    private state: BrokerState,
  ) {
    super(id);
  }

  static create(id: string, registrationNumber: string, now: Date): Broker {
    const created = new Broker(id, { registeredAt: now, registrationNumber });

    created.record(new BrokerRegistered(id, now));

    return created;
  }

  static rehydrate(id: string, state: BrokerState): Broker {
    return new Broker(id, state);
  }

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  get registrationNumber(): string {
    return this.state.registrationNumber;
  }

  toState(): BrokerState {
    return { ...this.state };
  }
}
