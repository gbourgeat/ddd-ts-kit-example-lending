import { EventSourcedAggregate, type AggregateHistory, type Appliers } from '@ddd-ts-kit/kernel';
import { Money } from '@/shared-kernel/money.vo';
import { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';
import { CreditApplicationAccountConsentGiven } from '@/contexts/credit-application/file/domain/events/credit-application-account-consent-given.event';
import { CreditApplicationCoBorrowerNamed } from '@/contexts/credit-application/file/domain/events/credit-application-co-borrower-named.event';
import { CreditApplicationGuarantorNamed } from '@/contexts/credit-application/file/domain/events/credit-application-guarantor-named.event';
import { CreditApplicationEntryCorrected } from '@/contexts/credit-application/file/domain/events/credit-application-entry-corrected.event';
import { InvalidAmount } from '@/contexts/credit-application/file/domain/errors/invalid-amount.error';
import { InvalidDuration } from '@/contexts/credit-application/file/domain/errors/invalid-duration.error';
import { InvalidCorrectionReason } from '@/contexts/credit-application/file/domain/errors/invalid-correction-reason.error';
import { CorrectionAlreadyRecorded } from '@/contexts/credit-application/file/domain/errors/correction-already-recorded.error';
import { UnknownEntry } from '@/contexts/credit-application/file/domain/errors/unknown-entry.error';
import { CreditApplicationDocumentAttached } from '@/contexts/credit-application/file/domain/events/credit-application-document-attached.event';
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
  | CreditApplicationDocumentAttached;

export interface CreditApplicationState {
  readonly applicantId: string;
  readonly amount: Money;
  readonly durationMonths: number;
  readonly registeredAt: Date;
  readonly accountConsent: AccountConsentState | undefined;
  readonly coBorrowerIds: readonly string[];
  readonly guarantorIds: readonly string[];
  /** How many entries the file holds: the position of the last one. */
  readonly entryCount: number;
  /** The entries that a correction already names: a second correction of one of them is refused. */
  readonly correctedEntryIds: readonly string[];
  /** The documents stored for the file, by their key in the object store: the file holds the reference, never the content. */
  readonly documentKeys: readonly string[];
}

/** What the applicant asks for, and the instant the application is registered. */
export interface LoanRequest {
  readonly amount: Money;
  readonly durationMonths: number;
  readonly registeredAt: Date;
}

export class CreditApplication extends EventSourcedAggregate<CreditApplicationEvent, CreditApplicationState> {
  private state: CreditApplicationState = {
    applicantId: '',
    amount: Money.ofCents(0),
    durationMonths: 0,
    registeredAt: new Date(0),
    accountConsent: undefined,
    coBorrowerIds: [],
    guarantorIds: [],
    entryCount: 0,
    correctedEntryIds: [],
    documentKeys: [],
  };

  private constructor(id: string) {
    super(id);
  }

  static create(id: string, applicantId: string, request: LoanRequest): CreditApplication {
    if (request.amount.cents <= 0) {
      throw InvalidAmount.forCents(request.amount.cents);
    }

    if (!Number.isSafeInteger(request.durationMonths) || request.durationMonths <= 0) {
      throw InvalidDuration.forMonths(request.durationMonths);
    }

    const created = new CreditApplication(id);

    created.record(
      new CreditApplicationSubmitted(id, applicantId, request.amount, request.durationMonths, request.registeredAt),
    );

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
    if (reason.trim() === '') {
      throw InvalidCorrectionReason.forReason();
    }

    if (!this.isEntryOfThisFile(correctedEntryId)) {
      throw UnknownEntry.forEntry(correctedEntryId);
    }

    if (this.state.correctedEntryIds.includes(correctedEntryId)) {
      throw CorrectionAlreadyRecorded.forEntry(correctedEntryId);
    }

    this.record(new CreditApplicationEntryCorrected(this.id, correctedAt, correctedEntryId, reason));
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

  get coBorrowerIds(): readonly string[] {
    return this.state.coBorrowerIds;
  }

  get guarantorIds(): readonly string[] {
    return this.state.guarantorIds;
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
    };
  }

  private restore(state: CreditApplicationState): void {
    this.state = state;
  }

  /** An entry is identified by the application it belongs to and its position in the file: `<application>#<position>`. */
  private isEntryOfThisFile(entryId: string): boolean {
    const separator = entryId.lastIndexOf('#');

    if (separator <= 0) {
      return false;
    }

    const position = Number(entryId.slice(separator + 1));

    return (
      entryId.slice(0, separator) === this.id &&
      Number.isSafeInteger(position) &&
      position >= 1 &&
      position <= this.state.entryCount
    );
  }

  private applySubmitted(event: CreditApplicationSubmitted): void {
    this.state = {
      ...this.state,
      applicantId: event.applicantId,
      amount: event.amount,
      durationMonths: event.durationMonths,
      registeredAt: event.occurredAt,
      entryCount: this.state.entryCount + 1,
    };
  }

  private applyAccountConsentGiven(event: CreditApplicationAccountConsentGiven): void {
    this.state = {
      ...this.state,
      accountConsent: { givenAt: event.occurredAt, expiresAt: event.expiresAt },
      entryCount: this.state.entryCount + 1,
    };
  }

  private applyCoBorrowerNamed(event: CreditApplicationCoBorrowerNamed): void {
    this.state = {
      ...this.state,
      coBorrowerIds: [...this.state.coBorrowerIds, event.coBorrowerId],
      entryCount: this.state.entryCount + 1,
    };
  }

  private applyGuarantorNamed(event: CreditApplicationGuarantorNamed): void {
    this.state = {
      ...this.state,
      guarantorIds: [...this.state.guarantorIds, event.guarantorId],
      entryCount: this.state.entryCount + 1,
    };
  }

  private applyEntryCorrected(event: CreditApplicationEntryCorrected): void {
    this.state = {
      ...this.state,
      correctedEntryIds: [...this.state.correctedEntryIds, event.correctedEntryId],
      entryCount: this.state.entryCount + 1,
    };
  }

  private applyDocumentAttached(event: CreditApplicationDocumentAttached): void {
    this.state = {
      ...this.state,
      documentKeys: [...this.state.documentKeys, event.documentKey],
      entryCount: this.state.entryCount + 1,
    };
  }
}
