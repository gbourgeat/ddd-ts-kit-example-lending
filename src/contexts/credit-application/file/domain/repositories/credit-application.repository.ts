import { Repository } from '@ddd-ts-kit/kernel';
import type { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import type { CreditApplicationEvent } from '@/contexts/credit-application/file/domain/values/credit-application-event';

export abstract class CreditApplicationRepository extends Repository<CreditApplication> {
  /** The applications whose refusal was recorded on or before `instant`. */
  abstract findRefusedOnOrBefore(instant: Date): Promise<readonly CreditApplication[]>;

  /** Every event the file of the application recorded, in the order it recorded them: empty when the application is unknown. */
  abstract historyOf(id: string): Promise<readonly CreditApplicationEvent[]>;
}
