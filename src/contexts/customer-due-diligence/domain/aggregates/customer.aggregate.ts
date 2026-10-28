import { EventSourcedAggregate, type AggregateHistory, type Appliers } from '@ddd-ts-kit/kernel';
import {
  CustomerIdentified,
  type IdentifiedPerson,
} from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';
import { CustomerBusinessRegistered } from '@/contexts/customer-due-diligence/domain/events/customer-business-registered.event';
import { BusinessAlreadyRegistered } from '@/contexts/customer-due-diligence/domain/errors/business-already-registered.error';
import { BusinessNotRegistered } from '@/contexts/customer-due-diligence/domain/errors/business-not-registered.error';
import { MissingReason } from '@/contexts/customer-due-diligence/domain/errors/missing-reason.error';
import { NoPossibleMatch } from '@/contexts/customer-due-diligence/domain/errors/no-possible-match.error';
import { IdentityValidityService } from '@/contexts/customer-due-diligence/domain/services/identity-validity.service';
import { CustomerDirectorsAndOwnersDeclared } from '@/contexts/customer-due-diligence/domain/events/customer-directors-and-owners-declared.event';
import { CustomerAdvisorAssigned } from '@/contexts/customer-due-diligence/domain/events/customer-advisor-assigned.event';
import { CustomerPossibleMatchFound } from '@/contexts/customer-due-diligence/domain/events/customer-possible-match-found.event';
import { CustomerSanctionsMatchConfirmed } from '@/contexts/customer-due-diligence/domain/events/customer-sanctions-match-confirmed.event';
import { CustomerRelationshipEnded } from '@/contexts/customer-due-diligence/domain/events/customer-relationship-ended.event';
import { CustomerPossibleMatchDismissed } from '@/contexts/customer-due-diligence/domain/events/customer-possible-match-dismissed.event';
import { CustomerRiskRated } from '@/contexts/customer-due-diligence/domain/events/customer-risk-rated.event';
import { RiskRating } from '@/contexts/customer-due-diligence/domain/vocabularies/risk-rating.vocabulary';
import { CustomerDueDiligenceRefreshed } from '@/contexts/customer-due-diligence/domain/events/customer-due-diligence-refreshed.event';
import { CustomerNotHighRisk } from '@/contexts/customer-due-diligence/domain/errors/customer-not-high-risk.error';
import { CustomerHighRiskApproved } from '@/contexts/customer-due-diligence/domain/events/customer-high-risk-approved.event';
import { DueDiligenceCalendarService } from '@/contexts/customer-due-diligence/domain/services/due-diligence-calendar.service';
import { CustomerDueDiligenceFlaggedOverdue } from '@/contexts/customer-due-diligence/domain/events/customer-due-diligence-flagged-overdue.event';

const dueDiligenceCalendar = new DueDiligenceCalendarService();
const identityValidity = new IdentityValidityService();

/** The facts the bank checked to know a person. */
type PersonIdentity = NonNullable<CustomerIdentified['identity']>;

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
  | CustomerDueDiligenceRefreshed
  | CustomerHighRiskApproved
  | CustomerDueDiligenceFlaggedOverdue;

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
  readonly identifiedPerson?: IdentifiedPerson;
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
  readonly highRiskApprovedAt?: Date | undefined;
  readonly dueDiligenceFlaggedOverdueAt?: Date | undefined;
}

export class Customer extends EventSourcedAggregate<CustomerEvent, CustomerState> {
  private state: CustomerState = { registeredAt: new Date(0) };

  private constructor(id: string) {
    super(id);
  }

  /** Identifies a person: refused when the document is expired on the day, or the proof of address too old. */
  static create(id: string, identity: PersonIdentity, now: Date, person?: IdentifiedPerson): Customer {
    identityValidity.check(id, identity, now);

    const created = new Customer(id);

    created.record(new CustomerIdentified(id, now, identity, person));

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
      identityValidity.check(this.id, person, now);
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

  /** Compliance approves a customer rated high risk; a customer not rated high is refused, a rating never given included. */
  approveHighRisk(now: Date): void {
    if (this.state.riskRating !== RiskRating.High) {
      throw CustomerNotHighRisk.forCustomer(this.id);
    }

    this.record(new CustomerHighRiskApproved(this.id, now));
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
        dueDiligenceCalendar.dueOn(now, riskRating),
        riskRating,
      ),
    );

    if (possibleMatch) {
      this.recordPossibleMatch(now);
    }
  }

  /** Flags the due diligence overdue once its refresh is past its date; a flag already set, or a due diligence still current, records nothing. */
  flagOverdueDueDiligence(now: Date): void {
    if (!this.isOverdueUnflagged(now)) {
      return;
    }

    this.record(new CustomerDueDiligenceFlaggedOverdue(this.id, now));
  }

  /** Whether the due diligence falls due before the instant: a due diligence never refreshed is not due. */
  isDueBefore(instant: Date): boolean {
    const dueOn = this.state.dueDiligenceDueOn;

    return dueOn !== undefined && dueOn.getTime() < instant.getTime();
  }

  /** Whether the business relationship ended on or before the instant: the personal data is erased past its retention. */
  hasEndedOnOrBefore(instant: Date): boolean {
    const endedAt = this.state.relationshipEndedAt;

    return endedAt !== undefined && endedAt.getTime() <= instant.getTime();
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
      [CustomerHighRiskApproved.eventName]: (event) => this.applyHighRiskApproved(event),
      [CustomerDueDiligenceFlaggedOverdue.eventName]: (event) => this.applyDueDiligenceFlaggedOverdue(event),
    };
  }

  private restore(state: CustomerState): void {
    this.state = state;
  }

  private applyIdentified(event: CustomerIdentified): void {
    if (event.identity === undefined) {
      return;
    }

    this.state = {
      ...this.state,
      registeredAt: event.occurredAt,
      ...(event.person === undefined ? {} : { identifiedPerson: event.person }),
    };
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

  /** A re-rating, whatever it is, clears an earlier approval of high risk: the customer must be approved again. */
  private applyRiskRated(event: CustomerRiskRated): void {
    this.state = { ...this.state, riskRating: event.rating, highRiskApprovedAt: undefined };
  }

  private applyDueDiligenceRefreshed(event: CustomerDueDiligenceRefreshed): void {
    this.state = {
      ...this.state,
      dueDiligenceRefreshedAt: event.occurredAt,
      dueDiligenceDueOn: event.nextDueOn,
      dueDiligenceFlaggedOverdueAt: undefined,
      ...(event.riskRating === undefined ? {} : { riskRating: event.riskRating }),
    };
  }

  private applyDueDiligenceFlaggedOverdue(event: CustomerDueDiligenceFlaggedOverdue): void {
    this.state = { ...this.state, dueDiligenceFlaggedOverdueAt: event.occurredAt };
  }

  private isOverdueUnflagged(now: Date): boolean {
    const dueOn = this.state.dueDiligenceDueOn;

    return (
      dueOn !== undefined &&
      this.state.dueDiligenceFlaggedOverdueAt === undefined &&
      dueDiligenceCalendar.isOverdue(dueOn, now)
    );
  }

  private applyHighRiskApproved(event: CustomerHighRiskApproved): void {
    this.state = { ...this.state, highRiskApprovedAt: event.occurredAt };
  }
}
