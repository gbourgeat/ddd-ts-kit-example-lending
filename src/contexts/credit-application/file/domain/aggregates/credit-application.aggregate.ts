import { EventSourcedAggregate, type AggregateHistory, type Appliers } from '@ddd-ts-kit/kernel';
import { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';

export type CreditApplicationEvent = CreditApplicationSubmitted;

export interface CreditApplicationState {
  readonly applicantId: string;
  readonly registeredAt: Date;
}

export class CreditApplication extends EventSourcedAggregate<CreditApplicationEvent, CreditApplicationState> {
  private state: CreditApplicationState = { applicantId: '', registeredAt: new Date(0) };

  private constructor(id: string) {
    super(id);
  }

  static create(id: string, applicantId: string, now: Date): CreditApplication {
    const created = new CreditApplication(id);

    created.record(new CreditApplicationSubmitted(id, applicantId, now));

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
    this.state = { applicantId: event.applicantId, registeredAt: event.occurredAt };
  }
}
