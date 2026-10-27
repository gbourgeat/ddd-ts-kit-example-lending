import { EventSourcedAggregate, type AggregateHistory, type Appliers } from '@ddd-ts-kit/kernel';
import { CustomerIdentified } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';
import { CustomerBusinessRegistered } from '@/contexts/customer-due-diligence/domain/events/customer-business-registered.event';
import { BusinessAlreadyRegistered } from '@/contexts/customer-due-diligence/domain/errors/business-already-registered.error';
import { BusinessNotRegistered } from '@/contexts/customer-due-diligence/domain/errors/business-not-registered.error';
import { IdentityDocumentExpired } from '@/contexts/customer-due-diligence/domain/errors/identity-document-expired.error';
import { ProofOfAddressTooOld } from '@/contexts/customer-due-diligence/domain/errors/proof-of-address-too-old.error';
import { CustomerDirectorsAndOwnersDeclared } from '@/contexts/customer-due-diligence/domain/events/customer-directors-and-owners-declared.event';

/** The facts the bank checked to know a person. */
type PersonIdentity = NonNullable<CustomerIdentified['identity']>;

/** A proof of address is accepted for this many months after its date. */
const PROOF_OF_ADDRESS_MAX_AGE_IN_MONTHS = 3;

export type CustomerEvent = CustomerIdentified | CustomerBusinessRegistered | CustomerDirectorsAndOwnersDeclared;

/** The facts of the registration of a business, as the bank records them. */
export interface BusinessRegistration {
  readonly legalName: string;
  readonly registrationNumber: string;
  readonly countryOfRegistration: string;
  readonly registeredOn: Date;
}

/** The directors and the beneficial owners of a business, each one identified as a person. */
export interface DeclaredOwners {
  readonly directors: readonly PersonIdentity[];
  readonly beneficialOwners: readonly PersonIdentity[];
}

export interface CustomerState {
  readonly registeredAt: Date;
  readonly business?: BusinessRegistration;
  readonly ownersDeclaredAt?: Date;
}

export class Customer extends EventSourcedAggregate<CustomerEvent, CustomerState> {
  private state: CustomerState = { registeredAt: new Date(0) };

  private constructor(id: string) {
    super(id);
  }

  /** Identifies a person: refused when the document is expired on the day, or the proof of address too old. */
  static create(id: string, identity: PersonIdentity, now: Date): Customer {
    Customer.checkIdentity(id, identity, now);

    const created = new Customer(id);

    created.record(new CustomerIdentified(id, now, identity));

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

  /** Records the directors and beneficial owners, each identified as a person; refused before the registration of the business. */
  declareDirectorsAndOwners(owners: DeclaredOwners, now: Date): void {
    if (this.state.business === undefined) {
      throw BusinessNotRegistered.forCustomer(this.id);
    }

    for (const person of [...owners.directors, ...owners.beneficialOwners]) {
      Customer.checkIdentity(this.id, person, now);
    }

    this.record(new CustomerDirectorsAndOwnersDeclared(this.id, now, owners.directors, owners.beneficialOwners));
  }

  toState(): CustomerState {
    return { ...this.state };
  }

  protected appliers(): Appliers<CustomerEvent> {
    return {
      [CustomerIdentified.eventName]: (event) => this.applyIdentified(event),
      [CustomerBusinessRegistered.eventName]: (event) => this.applyBusinessRegistered(event),
      [CustomerDirectorsAndOwnersDeclared.eventName]: (event) => this.applyDirectorsAndOwnersDeclared(event),
    };
  }

  private static checkIdentity(id: string, identity: PersonIdentity, now: Date): void {
    if (identity.documentExpiresOn.getTime() < now.getTime()) {
      throw IdentityDocumentExpired.forCustomer(id);
    }

    const oldestAcceptedProof = new Date(now.getTime());

    oldestAcceptedProof.setUTCMonth(oldestAcceptedProof.getUTCMonth() - PROOF_OF_ADDRESS_MAX_AGE_IN_MONTHS);

    if (identity.addressProofDatedOn.getTime() < oldestAcceptedProof.getTime()) {
      throw ProofOfAddressTooOld.forCustomer(id);
    }
  }

  private restore(state: CustomerState): void {
    this.state = state;
  }

  private applyIdentified(event: CustomerIdentified): void {
    if (event.identity === undefined) {
      return;
    }

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

  private applyDirectorsAndOwnersDeclared(event: CustomerDirectorsAndOwnersDeclared): void {
    this.state = { ...this.state, ownersDeclaredAt: event.occurredAt };
  }
}
