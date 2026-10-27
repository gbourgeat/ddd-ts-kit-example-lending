import { AggregateRoot } from '@ddd-ts-kit/kernel';
import { SuspiciousActivityReportFiled } from '@/contexts/financial-crime/domain/events/suspicious-activity-report-filed.event';

export interface SuspiciousActivityReportState {
  readonly registeredAt: Date;
  readonly subjectReference: string;
  /** The reference the financial intelligence unit gave the report; none while the report is pending. */
  readonly filingReference: string | undefined;
}

export class SuspiciousActivityReport extends AggregateRoot<string> {
  private constructor(
    id: string,
    private state: SuspiciousActivityReportState,
  ) {
    super(id);
  }

  /** A report is born pending: it is filed once the financial intelligence unit answers. */
  static create(id: string, subjectReference: string, now: Date): SuspiciousActivityReport {
    return new SuspiciousActivityReport(id, { registeredAt: now, subjectReference, filingReference: undefined });
  }

  static rehydrate(id: string, state: SuspiciousActivityReportState): SuspiciousActivityReport {
    return new SuspiciousActivityReport(id, state);
  }

  /** The financial intelligence unit received the report and gave its reference. */
  file(filingReference: string, now: Date): void {
    this.state = { ...this.state, filingReference };

    this.record(new SuspiciousActivityReportFiled(this.id, now));
  }

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  get subjectReference(): string {
    return this.state.subjectReference;
  }

  get filingReference(): string | undefined {
    return this.state.filingReference;
  }

  toState(): SuspiciousActivityReportState {
    return { ...this.state };
  }
}
