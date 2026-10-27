import { AggregateRoot } from '@ddd-ts-kit/kernel';
import { SuspiciousActivityReportFiled } from '@/contexts/financial-crime/domain/events/suspicious-activity-report-filed.event';

export interface SuspiciousActivityReportState {
  readonly registeredAt: Date;
  readonly subjectReference: string;
}

export class SuspiciousActivityReport extends AggregateRoot<string> {
  private constructor(
    id: string,
    private state: SuspiciousActivityReportState,
  ) {
    super(id);
  }

  static create(id: string, subjectReference: string, now: Date): SuspiciousActivityReport {
    const created = new SuspiciousActivityReport(id, { registeredAt: now, subjectReference });

    created.record(new SuspiciousActivityReportFiled(id, now));

    return created;
  }

  static rehydrate(id: string, state: SuspiciousActivityReportState): SuspiciousActivityReport {
    return new SuspiciousActivityReport(id, state);
  }

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  get subjectReference(): string {
    return this.state.subjectReference;
  }

  toState(): SuspiciousActivityReportState {
    return { ...this.state };
  }
}
