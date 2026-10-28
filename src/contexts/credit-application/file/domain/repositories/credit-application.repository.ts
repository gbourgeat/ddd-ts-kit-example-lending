import { Repository } from '@ddd-ts-kit/kernel';
import type { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';

export abstract class CreditApplicationRepository extends Repository<CreditApplication> {
  /** The applications whose refusal was recorded on or before `instant`. */
  abstract findRefusedOnOrBefore(instant: Date): Promise<readonly CreditApplication[]>;
}
