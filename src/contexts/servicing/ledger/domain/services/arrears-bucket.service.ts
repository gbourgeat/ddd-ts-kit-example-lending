import { ArrearsBucket } from '@/contexts/servicing/arrears/domain/vocabularies/arrears-bucket.vocabulary';

const FIRST_BUCKET_LAST_DAY = 30;
const SECOND_BUCKET_LAST_DAY = 60;
const THIRD_BUCKET_LAST_DAY = 90;

/** The arrears bucket a loan is in, from its days past due: none while it is not past due. */
export class ArrearsBucketService {
  of(daysPastDue: number): ArrearsBucket {
    if (daysPastDue <= 0) {
      return ArrearsBucket.None;
    }

    if (daysPastDue <= FIRST_BUCKET_LAST_DAY) {
      return ArrearsBucket.OneToThirtyDays;
    }

    if (daysPastDue <= SECOND_BUCKET_LAST_DAY) {
      return ArrearsBucket.ThirtyOneToSixtyDays;
    }

    if (daysPastDue <= THIRD_BUCKET_LAST_DAY) {
      return ArrearsBucket.SixtyOneToNinetyDays;
    }

    return ArrearsBucket.OverNinetyDays;
  }
}
