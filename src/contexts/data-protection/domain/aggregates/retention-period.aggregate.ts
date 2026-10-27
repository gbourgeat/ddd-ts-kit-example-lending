import { AggregateRoot } from '@ddd-ts-kit/kernel';

export interface RetentionPeriodState {
  readonly registeredAt: Date;
  readonly contextName: string;
  readonly kindOfData: string;
  readonly durationInMonths: number;
}

export class RetentionPeriod extends AggregateRoot<string> {
  private constructor(
    id: string,
    private state: RetentionPeriodState,
  ) {
    super(id);
  }

  static create(
    id: string,
    period: Pick<RetentionPeriodState, 'contextName' | 'kindOfData' | 'durationInMonths'>,
    now: Date,
  ): RetentionPeriod {
    return new RetentionPeriod(id, { registeredAt: now, ...period });
  }

  static rehydrate(id: string, state: RetentionPeriodState): RetentionPeriod {
    return new RetentionPeriod(id, state);
  }

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  get contextName(): string {
    return this.state.contextName;
  }

  get kindOfData(): string {
    return this.state.kindOfData;
  }

  get durationInMonths(): number {
    return this.state.durationInMonths;
  }

  toState(): RetentionPeriodState {
    return { ...this.state };
  }
}
