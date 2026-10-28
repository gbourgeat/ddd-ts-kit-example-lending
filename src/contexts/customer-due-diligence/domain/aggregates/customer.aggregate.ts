import { EventSourcedAggregate, type AggregateHistory, type Appliers } from '@ddd-ts-kit/kernel';
import { CustomerIdentified } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';
import { CustomerBusinessRegistered } from '@/contexts/customer-due-diligence/domain/events/customer-business-registered.event';
import { BusinessAlreadyRegistered } from '@/contexts/customer-due-diligence/domain/errors/business-already-registered.error';
import { BusinessNotRegistered } from '@/contexts/customer-due-diligence/domain/errors/business-not-registered.error';
import { IdentityDocumentExpired } from '@/contexts/customer-due-diligence/domain/errors/identity-document-expired.error';
import { MissingReason } from '@/contexts/customer-due-diligence/domain/errors/missing-reason.error';
import { NoPossibleMatch } from '@/contexts/customer-due-diligence/domain/errors/no-possible-match.error';
import { ProofOfAddressTooOld } from '@/contexts/customer-due-diligence/domain/errors/proof-of-address-too-old.error';
import { CustomerDirectorsAndOwnersDeclared } from '@/contexts/customer-due-diligence/domain/events/customer-directors-and-owners-declared.event';
import { CustomerAdvisorAssigned } from '@/contexts/customer-due-diligence/domain/events/customer-advisor-assigned.event';
import { CustomerPossibleMatchFound } from '@/contexts/customer-due-diligence/domain/events/customer-possible-match-found.event';
import { CustomerSanctionsMatchConfirmed } from '@/contexts/customer-due-diligence/domain/events/customer-sanctions-match-confirmed.event';
import { CustomerRelationshipEnded } from '@/contexts/customer-due-diligence/domain/events/customer-relationship-ended.event';
import { CustomerPossibleMatchDismissed } from '@/contexts/customer-due-diligence/domain/events/customer-possible-match-dismissed.event';
import { CustomerRiskRated } from '@/contexts/customer-due-diligence/domain/events/customer-risk-rated.event';
import { RiskRating } from '@/contexts/customer-due-diligence/domain/vocabularies/risk-rating.vocabulary';
import { CustomerDueDiligenceRefreshed } from '@/contexts/customer-due-diligence/domain/events/customer-due-diligence-refreshed.event';

/** The facts the bank checked to know a person. */
type PersonIdentity = NonNullable<CustomerIdentified['identity']>;

/** A proof of address is accepted for this many months after its date. */
const PROOF_OF_ADDRESS_MAX_AGE_IN_MONTHS = 3;

/** How many years a due diligence stays current, by the risk rating of the customer. */
const REFRESH_CADENCE_IN_YEARS: Record<RiskRating, number> = {
  [RiskRating.High]: 1,
  [RiskRating.Medium]: 3,
  [RiskRating.Low]: 5,
};

/** A customer never rated is refreshed yearly. */
const NEVER_RATED_REFRESH_CADENCE_IN_YEARS = 1;

export type CustomerEvent =
  | CustomerIdentified
  | CustomerBusinessRegistered
  | CustomerDirectorsAndOwnersDeclared
  | CustomerAdvisorAssigned
  | CustomerPossibleMatchFound
  | CustomerSanctionsMatchConfirmed
  | CustomerRelationshipEnded
  | CustomerPossibleMatchDismissed
  | CustomerRiskRated
  | CustomerDueDiligenceRefreshed;

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
  readonly advisorId?: string;
  readonly possibleMatchFoundAt?: Date;
  readonly possibleMatchDismissedAt?: Date | undefined;
  readonly sanctionsMatchConfirmedAt?: Date;
  readonly relationshipEndedAt?: Date;
  readonly riskRating?: RiskRating;
  readonly dueDiligenceRefreshedAt?: Date;
  readonly dueDiligenceDueOn?: Date;
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

  /** Gives the customer its advisor; a later assignment replaces the advisor, the earlier one is kept in the events. */
  assignAdvisor(advisorId: string, now: Date): void {
    this.record(new CustomerAdvisorAssigned(this.id, now, advisorId));
  }

  /** Records that the screening found a person on a list: a possible match, which waits for compliance review and is never decided here. */
  recordPossibleMatch(now: Date): void {
    this.record(new CustomerPossibleMatchFound(this.id, now));
  }

  /** Compliance confirms the possible match waiting for review: it becomes a sanctions match. Only a pending possible match can be confirmed. */
  confirmSanctionsMatch(now: Date): void {
    if (!this.hasPendingPossibleMatch()) {
      throw NoPossibleMatch.forCustomer(this.id);
    }

    this.record(new CustomerSanctionsMatchConfirmed(this.id, now));
  }

  /** Compliance clears the possible match waiting for review, with its reason: the customer is not on the list. Only a pending possible match can be dismissed. */
  dismissMatch(reason: string, now: Date): void {
    if (reason.trim() === '') {
      throw MissingReason.forDismissal(this.id);
    }

    if (!this.hasPendingPossibleMatch()) {
      throw NoPossibleMatch.forCustomer(this.id);
    }

    this.record(new CustomerPossibleMatchDismissed(this.id, now, reason));
  }

  /** Ends the business relationship with the customer; ending one already ended records nothing, so a repeated reaction is safe. */
  endRelationship(now: Date): void {
    if (this.state.relationshipEndedAt !== undefined) {
      return;
    }

    this.record(new CustomerRelationshipEnded(this.id, now));
  }

  /** Records the risk rating of the customer, low, medium or high; a later rating replaces the earlier one, which is kept in the events. */
  rateRisk(rating: RiskRating, now: Date): void {
    this.record(new CustomerRiskRated(this.id, now, rating));
  }

  /** Refreshes the due diligence: the screening outcome is recorded, a possible match goes to review, the risk rating is restated only when the customer has one. */
  refreshDueDiligence(screening: 'clear' | 'possible-match', now: Date): void {
    const possibleMatch = screening === 'possible-match';
    const riskRating = this.state.riskRating;

    this.record(
      new CustomerDueDiligenceRefreshed(
        this.id,
        now,
        possibleMatch,
        Customer.dueDiligenceDueOn(now, riskRating),
        riskRating,
      ),
    );

    if (possibleMatch) {
      this.recordPossibleMatch(now);
    }
  }

  toState(): CustomerState {
    return { ...this.state };
  }

  protected appliers(): Appliers<CustomerEvent> {
    return {
      [CustomerIdentified.eventName]: (event) => this.applyIdentified(event),
      [CustomerBusinessRegistered.eventName]: (event) => this.applyBusinessRegistered(event),
      [CustomerDirectorsAndOwnersDeclared.eventName]: (event) => this.applyDirectorsAndOwnersDeclared(event),
      [CustomerAdvisorAssigned.eventName]: (event) => this.applyAdvisorAssigned(event),
      [CustomerPossibleMatchFound.eventName]: (event) => this.applyPossibleMatchFound(event),
      [CustomerSanctionsMatchConfirmed.eventName]: (event) => this.applySanctionsMatchConfirmed(event),
      [CustomerRelationshipEnded.eventName]: (event) => this.applyRelationshipEnded(event),
      [CustomerPossibleMatchDismissed.eventName]: (event) => this.applyPossibleMatchDismissed(event),
      [CustomerRiskRated.eventName]: (event) => this.applyRiskRated(event),
      [CustomerDueDiligenceRefreshed.eventName]: (event) => this.applyDueDiligenceRefreshed(event),
    };
  }

  /** The day the due diligence falls due again: the cadence of the risk rating of the customer, yearly while it is never rated. */
  private static dueDiligenceDueOn(now: Date, riskRating: RiskRating | undefined): Date {
    const years =
      riskRating === undefined ? NEVER_RATED_REFRESH_CADENCE_IN_YEARS : REFRESH_CADENCE_IN_YEARS[riskRating];

    const dueOn = new Date(now.getTime());

    dueOn.setUTCFullYear(dueOn.getUTCFullYear() + years);

    return dueOn;
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

  private applyAdvisorAssigned(event: CustomerAdvisorAssigned): void {
    this.state = { ...this.state, advisorId: event.advisorId };
  }

  private applyPossibleMatchFound(event: CustomerPossibleMatchFound): void {
    this.state = { ...this.state, possibleMatchFoundAt: event.occurredAt, possibleMatchDismissedAt: undefined };
  }

  private applySanctionsMatchConfirmed(event: CustomerSanctionsMatchConfirmed): void {
    this.state = { ...this.state, sanctionsMatchConfirmedAt: event.occurredAt };
  }

  private hasPendingPossibleMatch(): boolean {
    return (
      this.state.possibleMatchFoundAt !== undefined &&
      this.state.sanctionsMatchConfirmedAt === undefined &&
      this.state.possibleMatchDismissedAt === undefined
    );
  }

  private applyRelationshipEnded(event: CustomerRelationshipEnded): void {
    this.state = { ...this.state, relationshipEndedAt: event.occurredAt };
  }

  private applyPossibleMatchDismissed(event: CustomerPossibleMatchDismissed): void {
    this.state = { ...this.state, possibleMatchDismissedAt: event.occurredAt };
  }

  private applyRiskRated(event: CustomerRiskRated): void {
    this.state = { ...this.state, riskRating: event.rating };
  }

  private applyDueDiligenceRefreshed(event: CustomerDueDiligenceRefreshed): void {
    this.state = {
      ...this.state,
      dueDiligenceRefreshedAt: event.occurredAt,
      dueDiligenceDueOn: event.nextDueOn,
      ...(event.riskRating === undefined ? {} : { riskRating: event.riskRating }),
    };
  }
}
