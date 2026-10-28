import { EventSourcedAggregate, type AggregateHistory, type Appliers } from '@ddd-ts-kit/kernel';
import { Money } from '@/shared-kernel/money.vo';
import { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';
import { CreditApplicationAccountConsentGiven } from '@/contexts/credit-application/file/domain/events/credit-application-account-consent-given.event';
import { CreditApplicationCoBorrowerNamed } from '@/contexts/credit-application/file/domain/events/credit-application-co-borrower-named.event';
import { CreditApplicationGuarantorNamed } from '@/contexts/credit-application/file/domain/events/credit-application-guarantor-named.event';
import { CreditApplicationEntryCorrected } from '@/contexts/credit-application/file/domain/events/credit-application-entry-corrected.event';
import { CreditApplicationDocumentAttached } from '@/contexts/credit-application/file/domain/events/credit-application-document-attached.event';
import { CreditApplicationRegisterConsulted } from '@/contexts/credit-application/file/domain/events/credit-application-register-consulted.event';
import {
  CreditApplicationAssessed,
  type ProposedOutcome,
} from '@/contexts/credit-application/file/domain/events/credit-application-assessed.event';
import { CreditApplicationRefusalReviewed } from '@/contexts/credit-application/file/domain/events/credit-application-refusal-reviewed.event';
import type { RefusalConclusion } from '@/contexts/credit-application/file/domain/values/refusal-conclusion';
import { CreditApplicationDecided } from '@/contexts/credit-application/file/domain/events/credit-application-decided.event';
import { CreditApplicationBrought } from '@/contexts/credit-application/file/domain/events/credit-application-brought.event';
import { DecisionCheckService } from '@/contexts/credit-application/file/domain/services/decision-check.service';
import type { DecisionInput } from '@/contexts/credit-application/file/domain/values/decision-input';
import type { DecisionOutcome } from '@/contexts/credit-application/decision/domain/vocabularies/decision-outcome.vocabulary';
import { CreditApplicationRequestFoundOutsideProductTerms } from '@/contexts/credit-application/file/domain/events/credit-application-request-found-outside-product-terms.event';
import { CreditApplicationRequestCheckedWithUnknownProductTerms } from '@/contexts/credit-application/file/domain/events/credit-application-request-checked-with-unknown-product-terms.event';
import { ProductTermsCheckService } from '@/contexts/credit-application/file/domain/services/product-terms-check.service';
import { EntryCorrectionService } from '@/contexts/credit-application/file/domain/services/entry-correction.service';
import { RefusalReviewService } from '@/contexts/credit-application/file/domain/services/refusal-review.service';
import { ApplicationRequestService } from '@/contexts/credit-application/file/domain/services/application-request.service';
import type { ApplicationRequest } from '@/contexts/credit-application/file/domain/values/application-request';
import type { ProductLimits } from '@/contexts/credit-application/file/domain/values/product-limits';
import type { ProductTermsFinding } from '@/contexts/credit-application/file/domain/values/product-terms-finding';
import {
  AccountConsent,
  type AccountConsentState,
} from '@/contexts/credit-application/file/domain/entities/account-consent.entity';

export type CreditApplicationEvent =
  | CreditApplicationSubmitted
  | CreditApplicationAccountConsentGiven
  | CreditApplicationCoBorrowerNamed
  | CreditApplicationGuarantorNamed
  | CreditApplicationEntryCorrected
  | CreditApplicationDocumentAttached
  | CreditApplicationRegisterConsulted
  | CreditApplicationAssessed
  | CreditApplicationRequestFoundOutsideProductTerms
  | CreditApplicationRequestCheckedWithUnknownProductTerms
  | CreditApplicationRefusalReviewed
  | CreditApplicationDecided
  | CreditApplicationBrought;

export interface CreditApplicationState {
  readonly applicantId: string;
  readonly amount: Money;
  readonly durationMonths: number;
  readonly registeredAt: Date;
  /** The branch the application was submitted on: empty when no advisor holds the applicant, or when it was submitted before the branch was recorded. */
  readonly branchId: string;
  /** The product the application is for: empty when none was given. */
  readonly productId: string;
  /** What the checks against the product found: a limit the request breaks, or terms not known. */
  readonly productTermsFindings: readonly ProductTermsFinding[];
  readonly accountConsent: AccountConsentState | undefined;
  readonly coBorrowerIds: readonly string[];
  readonly guarantorIds: readonly string[];
  /** How many entries the file holds: the position of the last one. */
  readonly entryCount: number;
  /** The entries that a correction already names: a second correction of one of them is refused. */
  readonly correctedEntryIds: readonly string[];
  /** The documents stored for the file, by their key in the object store: the file holds the reference, never the content. */
  readonly documentKeys: readonly string[];
  /** How many parties the last consultation of the register found listed: undefined until the register is consulted. */
  readonly listedPartyCount: number | undefined;
  /** The last assessment: the outcome it proposed and the person who ran it, undefined until the application is assessed. */
  readonly lastAssessment: { readonly proposedOutcome: ProposedOutcome; readonly assessorId: string } | undefined;
  /** The conclusion of the review of the last assessment, undefined until a person reviews it. */
  readonly refusalReviewConclusion: RefusalConclusion | undefined;
  /** The reviewer of the last refusal review: with the assessor, the person who prepared the file. */
  readonly refusalReviewerId: string;
  /** The decision taken on the application, undefined until the decider decides it. */
  readonly decision: { readonly outcome: DecisionOutcome; readonly deciderId: string } | undefined;
}

export class CreditApplication extends EventSourcedAggregate<CreditApplicationEvent, CreditApplicationState> {
  private state: CreditApplicationState = {
    applicantId: '',
    amount: Money.ofCents(0),
    durationMonths: 0,
    registeredAt: new Date(0),
    branchId: '',
    productId: '',
    productTermsFindings: [],
    accountConsent: undefined,
    coBorrowerIds: [],
    guarantorIds: [],
    entryCount: 0,
    correctedEntryIds: [],
    documentKeys: [],
    listedPartyCount: undefined,
    lastAssessment: undefined,
    refusalReviewConclusion: undefined,
    refusalReviewerId: '',
    decision: undefined,
  };

  private constructor(id: string) {
    super(id);
  }

  static create(id: string, applicantId: string, request: ApplicationRequest): CreditApplication {
    const created = new CreditApplication(id);

    created.record(new ApplicationRequestService().submittedEventOf(id, applicantId, request));

    return created;
  }

  static rehydrate(
    id: string,
    history: AggregateHistory<CreditApplicationEvent, CreditApplicationState>,
  ): CreditApplication {
    const loaded = new CreditApplication(id);

    return loaded.replay(history, (state) => loaded.restore(state));
  }

  /** The applicant gives the consent to read their accounts for this application, at the instant `givenAt`. */
  giveAccountConsent(givenAt: Date): void {
    const consent = AccountConsent.give(this.id, givenAt);

    this.record(new CreditApplicationAccountConsentGiven(this.id, givenAt, consent.expiresAt));
  }

  /** The applicant names a person as the co-borrower of the application, who shares the debt. */
  nameCoBorrower(coBorrowerId: string, namedAt: Date): void {
    this.record(new CreditApplicationCoBorrowerNamed(this.id, namedAt, coBorrowerId));
  }

  /** The applicant attaches a document to the file: its content is already stored under `document.key`. */
  attachDocument(document: { key: string; mediaType: string; sizeBytes: number }, attachedAt: Date): void {
    this.record(
      new CreditApplicationDocumentAttached(this.id, attachedAt, document.key, document.mediaType, document.sizeBytes),
    );
  }

  /** The applicant names a person as the guarantor of the application, who backs the debt if the borrower does not pay. */
  nameGuarantor(guarantorId: string, namedAt: Date): void {
    this.record(new CreditApplicationGuarantorNamed(this.id, namedAt, guarantorId));
  }

  /**
   * The applicant corrects an earlier entry of the file. The correction is a later entry: it names the entry it
   * corrects and says why. The corrected entry is never edited, and a second correction of it is refused.
   */
  correctEntry(correctedEntryId: string, reason: string, correctedAt: Date): void {
    this.record(new EntryCorrectionService().eventOf(this.id, this.state, { correctedEntryId, reason, correctedAt }));
  }

  /** The repayment incident register was consulted for the parties of the application: the answer is kept, never the names. */
  recordRegisterConsultation(
    parties: readonly { readonly customerId: string; readonly listed: boolean }[],
    consultedAt: Date,
  ): void {
    this.record(new CreditApplicationRegisterConsulted(this.id, consultedAt, parties));
  }

  /** The application is assessed: what it rests on and the outcome proposed are kept in the file, with the instant and the person of the assessment. */
  assess(assessment: CreditApplicationAssessed['assessment'], assessedAt: Date, assessorId: string): void {
    this.record(new CreditApplicationAssessed(this.id, assessedAt, assessment, assessorId));
  }

  /**
   * A person reviews the refusal the last assessment proposed: the conclusion is kept with the reviewer, the instant and
   * the reason. The machine never refuses alone, and the assessor never reviews its own assessment.
   */
  reviewProposedRefusal(review: {
    reviewerId: string;
    conclusion: RefusalConclusion;
    reason: string;
    reviewedAt: Date;
  }): void {
    this.record(new RefusalReviewService().eventOf(this.id, this.state, review));
  }

  /** The decider decides the application: approve, approve with conditions or refuse, checked against the file. */
  decide(decision: DecisionInput): void {
    this.record(new DecisionCheckService().eventOf(this.id, this.state, decision));
  }

  /** A broker brought the application for the customer it was submitted for: the broker is kept in the file. */
  recordBrought(brokerId: string, broughtAt: Date): void {
    this.record(new CreditApplicationBrought(this.id, broughtAt, brokerId));
  }

  /**
   * The check of the application against the limits of its product: each limit the request breaks is kept as a finding,
   * or, when the terms of the product are not known, that they are not. The application is never refused by a check.
   */
  checkAgainstProductTerms(limits: ProductLimits | undefined, checkedAt: Date): void {
    const { productId, amount, durationMonths } = this.state;
    const facts = { aggregateId: this.id, checkedAt, productId, amountCents: amount.cents, durationMonths };

    for (const event of new ProductTermsCheckService().eventsOf(facts, limits)) {
      this.record(event);
    }
  }

  /** Whether the applicant's consent to read the accounts is given and not yet expired at `instant`. */
  hasValidAccountConsentAt(instant: Date): boolean {
    if (this.state.accountConsent === undefined) {
      return false;
    }

    return AccountConsent.rehydrate(this.id, this.state.accountConsent).isValidAt(instant);
  }

  get applicantId(): string {
    return this.state.applicantId;
  }

  get amount(): Money {
    return this.state.amount;
  }

  get durationMonths(): number {
    return this.state.durationMonths;
  }

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  get branchId(): string {
    return this.state.branchId;
  }

  get coBorrowerIds(): readonly string[] {
    return this.state.coBorrowerIds;
  }

  /** The keys of the documents stored for the file, in the order they were attached. */
  get documentKeys(): readonly string[] {
    return this.state.documentKeys;
  }

  get guarantorIds(): readonly string[] {
    return this.state.guarantorIds;
  }

  /** The persons who prepared the file: the assessor of the last assessment and the reviewer of its refusal. */
  get preparerIds(): readonly string[] {
    return [this.state.lastAssessment?.assessorId ?? '', this.state.refusalReviewerId].filter((id) => id !== '');
  }

  /** How many parties the last consultation of the register found listed, or undefined when it was never consulted. */
  get listedPartyCount(): number | undefined {
    return this.state.listedPartyCount;
  }

  toState(): CreditApplicationState {
    return { ...this.state };
  }

  protected appliers(): Appliers<CreditApplicationEvent> {
    return {
      [CreditApplicationSubmitted.eventName]: (event) => this.applySubmitted(event),
      [CreditApplicationAccountConsentGiven.eventName]: (event) => this.applyAccountConsentGiven(event),
      [CreditApplicationCoBorrowerNamed.eventName]: (event) => this.applyCoBorrowerNamed(event),
      [CreditApplicationGuarantorNamed.eventName]: (event) => this.applyGuarantorNamed(event),
      [CreditApplicationEntryCorrected.eventName]: (event) => this.applyEntryCorrected(event),
      [CreditApplicationDocumentAttached.eventName]: (event) => this.applyDocumentAttached(event),
      [CreditApplicationRegisterConsulted.eventName]: (event) => this.applyRegisterConsulted(event),
      [CreditApplicationAssessed.eventName]: (event) => this.applyAssessed(event),
      [CreditApplicationRequestFoundOutsideProductTerms.eventName]: (event) => this.applyFinding(event.finding),
      [CreditApplicationRequestCheckedWithUnknownProductTerms.eventName]: (event) =>
        this.applyFinding({ kind: 'terms-unknown', productId: event.productId }),
      [CreditApplicationRefusalReviewed.eventName]: (event) => this.applyRefusalReviewed(event),
      [CreditApplicationDecided.eventName]: (event) => this.applyDecided(event),
      // The broker changes no state of the file: the event itself keeps who brought the application.
      [CreditApplicationBrought.eventName]: () => undefined,
    };
  }

  private restore(state: CreditApplicationState): void {
    this.state = state;
  }

  private applySubmitted(event: CreditApplicationSubmitted): void {
    this.applyEntryAppended({
      applicantId: event.applicantId,
      amount: event.amount,
      durationMonths: event.durationMonths,
      registeredAt: event.occurredAt,
      branchId: event.branchId,
      productId: event.productId,
    });
  }

  /** A fact is appended to the file: the state takes what it changes, and the file holds one entry more. */
  private applyEntryAppended(changes: Partial<CreditApplicationState>): void {
    this.state = { ...this.state, ...changes, entryCount: this.state.entryCount + 1 };
  }

  private applyAccountConsentGiven(event: CreditApplicationAccountConsentGiven): void {
    this.applyEntryAppended({ accountConsent: { givenAt: event.occurredAt, expiresAt: event.expiresAt } });
  }

  private applyCoBorrowerNamed(event: CreditApplicationCoBorrowerNamed): void {
    this.applyEntryAppended({ coBorrowerIds: [...this.state.coBorrowerIds, event.coBorrowerId] });
  }

  private applyGuarantorNamed(event: CreditApplicationGuarantorNamed): void {
    this.applyEntryAppended({ guarantorIds: [...this.state.guarantorIds, event.guarantorId] });
  }

  private applyEntryCorrected(event: CreditApplicationEntryCorrected): void {
    this.applyEntryAppended({ correctedEntryIds: [...this.state.correctedEntryIds, event.correctedEntryId] });
  }

  private applyDocumentAttached(event: CreditApplicationDocumentAttached): void {
    this.applyEntryAppended({ documentKeys: [...this.state.documentKeys, event.documentKey] });
  }

  private applyRegisterConsulted(event: CreditApplicationRegisterConsulted): void {
    this.applyEntryAppended({ listedPartyCount: event.parties.filter((party) => party.listed).length });
  }

  /** A new assessment replaces the last one, and its proposal is not reviewed yet. */
  private applyAssessed(event: CreditApplicationAssessed): void {
    this.applyEntryAppended({
      lastAssessment: { proposedOutcome: event.assessment.proposedOutcome, assessorId: event.assessorId },
      refusalReviewConclusion: undefined,
      refusalReviewerId: '',
    });
  }

  private applyFinding(finding: ProductTermsFinding): void {
    this.applyEntryAppended({ productTermsFindings: [...this.state.productTermsFindings, finding] });
  }

  private applyRefusalReviewed(event: CreditApplicationRefusalReviewed): void {
    this.applyEntryAppended({ refusalReviewConclusion: event.conclusion, refusalReviewerId: event.reviewerId });
  }

  private applyDecided(event: CreditApplicationDecided): void {
    this.applyEntryAppended({ decision: { outcome: event.outcome, deciderId: event.deciderId } });
  }
}
