import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

export class SuspiciousActivityReportFiled extends NamedDomainEvent(
  'financial-crime.suspicious-activity-report.filed',
) {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
  ) {
    super();
  }
}
