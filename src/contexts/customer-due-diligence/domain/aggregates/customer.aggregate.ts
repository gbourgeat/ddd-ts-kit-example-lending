import { EventSourcedAggregate, type AggregateHistory, type Appliers } from '@ddd-ts-kit/kernel';
import { CustomerIdentified } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';
import { CustomerBusinessRegistered } from '@/contexts/customer-due-diligence/domain/events/customer-business-registered.event';
import { BusinessAlreadyRegistered } from '@/contexts/customer-due-diligence/domain/errors/business-already-registered.error';

export type CustomerEvent = CustomerIdentified | CustomerBusinessRegistered;

/** The facts of the registration of a business, as the bank records them. */
export interface BusinessRegistration {
  readonly legalName: string;
  readonly registrationNumber: string;
  readonly countryOfRegistration: string;
  readonly registeredOn: Date;
}

export interface CustomerState {
  readonly registeredAt: Date;
  readonly business?: BusinessRegistration;
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

  /** Records the registration of the business of this customer; a second one is refused, never an overwrite. */
  registerBusiness(business: BusinessRegistration, now: Date): void {
    if (this.state.business !== undefined) {
      throw BusinessAlreadyRegistered.forCustomer(this.id);
    }

    this.record(
      new CustomerBusinessRegistered(
        this.id,
        now,
        business.legalName,
        business.registrationNumber,
        business.countryOfRegistration,
        business.registeredOn,
      ),
    );
  }

  toState(): CustomerState {
    return { ...this.state };
  }

  protected appliers(): Appliers<CustomerEvent> {
    return {
      [CustomerIdentified.eventName]: (event) => this.applyIdentified(event),
      [CustomerBusinessRegistered.eventName]: (event) => this.applyBusinessRegistered(event),
    };
  }

  private restore(state: CustomerState): void {
    this.state = state;
  }

  private applyIdentified(event: CustomerIdentified): void {
    this.state = { ...this.state, registeredAt: event.occurredAt };
  }

  private applyBusinessRegistered(event: CustomerBusinessRegistered): void {
    this.state = {
      ...this.state,
      business: {
        legalName: event.legalName,
        registrationNumber: event.registrationNumber,
        countryOfRegistration: event.countryOfRegistration,
        registeredOn: event.registeredOn,
      },
    };
  }
}
