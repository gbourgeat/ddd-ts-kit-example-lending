import { AggregateRoot } from '@ddd-ts-kit/kernel';
import { BrokerRegistered } from '@/contexts/brokerage/domain/events/broker-registered.event';
import { BrokerRegistrationLapsed } from '@/contexts/brokerage/domain/events/broker-registration-lapsed.event';

export interface BrokerState {
  readonly registeredAt: Date;
  readonly registrationNumber: string;
  /** The day the registration was found no longer valid; undefined while the registration is not lapsed. */
  readonly lapsedOn?: Date | undefined;
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

  /** Marks the registration lapsed on the day it was found no longer valid; a broker already lapsed is not marked again. */
  markLapsed(day: Date): void {
    if (this.state.lapsedOn !== undefined) {
      return;
    }

    this.state = { ...this.state, lapsedOn: day };

    this.record(new BrokerRegistrationLapsed(this.id, day));
  }

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  get registrationNumber(): string {
    return this.state.registrationNumber;
  }

  get lapsedOn(): Date | undefined {
    return this.state.lapsedOn;
  }

  toState(): BrokerState {
    return { ...this.state };
  }
}
