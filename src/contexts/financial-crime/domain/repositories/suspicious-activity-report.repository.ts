import { Repository } from '@ddd-ts-kit/kernel';
import type { SuspiciousActivityReport } from '@/contexts/financial-crime/domain/aggregates/suspicious-activity-report.aggregate';

export abstract class SuspiciousActivityReportRepository extends Repository<SuspiciousActivityReport> {}
