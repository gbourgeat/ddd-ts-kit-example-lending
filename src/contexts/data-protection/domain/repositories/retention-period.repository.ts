import { Repository } from '@ddd-ts-kit/kernel';
import type { RetentionPeriod } from '@/contexts/data-protection/domain/aggregates/retention-period.aggregate';

export abstract class RetentionPeriodRepository extends Repository<RetentionPeriod> {}
