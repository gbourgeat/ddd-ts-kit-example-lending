import { InMemoryRepository, snapshots } from '@ddd-ts-kit/testing';
import { SuspiciousActivityReport } from '@/contexts/financial-crime/domain/aggregates/suspicious-activity-report.aggregate';
import type { SuspiciousActivityReportRepository } from '@/contexts/financial-crime/domain/repositories/suspicious-activity-report.repository';

export class FakeSuspiciousActivityReportRepository
  extends InMemoryRepository<SuspiciousActivityReport>
  implements SuspiciousActivityReportRepository
{
  constructor() {
    super(
      snapshots({
        toSnapshot: (stored: SuspiciousActivityReport) => ({ id: stored.id, state: stored.toState() }),
        fromSnapshot: ({ id, state }) => SuspiciousActivityReport.rehydrate(id, state),
      }),
    );
  }
}
