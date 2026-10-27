import { EventSourcedAggregate, type AggregateHistory, type Appliers } from '@ddd-ts-kit/kernel';
import { Money } from '@/shared-kernel/money.vo';
import { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';
import { InvalidAmount } from '@/contexts/credit-application/file/domain/errors/invalid-amount.error';
import { InvalidDuration } from '@/contexts/credit-application/file/domain/errors/invalid-duration.error';

export type CreditApplicationEvent = CreditApplicationSubmitted;

export interface CreditApplicationState {
  readonly applicantId: string;
  readonly amount: Money;
  readonly durationMonths: number;
  readonly registeredAt: Date;
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

  toState(): CreditApplicationState {
    return { ...this.state };
  }

  protected appliers(): Appliers<CreditApplicationEvent> {
    return {
      [CreditApplicationSubmitted.eventName]: (event) => this.applySubmitted(event),
    };
  }

  private restore(state: CreditApplicationState): void {
    this.state = state;
  }

  private applySubmitted(event: CreditApplicationSubmitted): void {
    this.state = {
      applicantId: event.applicantId,
      amount: event.amount,
      durationMonths: event.durationMonths,
      registeredAt: event.occurredAt,
    };
  }
}
