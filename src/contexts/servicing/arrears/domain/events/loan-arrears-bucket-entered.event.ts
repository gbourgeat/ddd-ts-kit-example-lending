import { NamedDomainEvent } from '@ddd-ts-kit/kernel';
import type { ArrearsBucket } from '@/contexts/servicing/arrears/domain/vocabularies/arrears-bucket.vocabulary';

/** The loan was placed in an arrears bucket by a classification of its days past due: the bucket it is now in. */
export class LoanArrearsBucketEntered extends NamedDomainEvent('servicing.loan.arrears-bucket-entered') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly bucket: ArrearsBucket,
  ) {
    super();
  }
}
