import { Repository } from '@ddd-ts-kit/kernel';
import type { Alert } from '@/contexts/financial-crime/domain/aggregates/alert.aggregate';

export abstract class AlertRepository extends Repository<Alert> {
  /** The alert raised on the repayment with this reference, if one was raised: a repayment raises at most one alert. */
  abstract findByRepaymentReference(repaymentReference: string): Promise<Alert | undefined>;
}
