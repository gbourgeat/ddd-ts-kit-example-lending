import { describe, expect, it } from '@jest/globals';
import { ArrearsBucketService } from '@/contexts/servicing/ledger/domain/services/arrears-bucket.service';
import { ArrearsBucket } from '@/contexts/servicing/arrears/domain/vocabularies/arrears-bucket.vocabulary';

describe('ArrearsBucketService', () => {
  it('holds no state of its own', () => {
    expect(Object.keys(new ArrearsBucketService())).toEqual([]);
  });

  it('places a loan not past due in no arrears bucket', () => {
    expect(new ArrearsBucketService().of(0)).toBe(ArrearsBucket.None);
  });

  it('places a loan 1 to 30 days past due in the first bucket', () => {
    expect(new ArrearsBucketService().of(1)).toBe(ArrearsBucket.OneToThirtyDays);
    expect(new ArrearsBucketService().of(30)).toBe(ArrearsBucket.OneToThirtyDays);
  });

  it('places a loan 31 to 60 days past due in the second bucket', () => {
    expect(new ArrearsBucketService().of(31)).toBe(ArrearsBucket.ThirtyOneToSixtyDays);
    expect(new ArrearsBucketService().of(60)).toBe(ArrearsBucket.ThirtyOneToSixtyDays);
  });

  it('places a loan 61 to 90 days past due in the third bucket', () => {
    expect(new ArrearsBucketService().of(61)).toBe(ArrearsBucket.SixtyOneToNinetyDays);
    expect(new ArrearsBucketService().of(90)).toBe(ArrearsBucket.SixtyOneToNinetyDays);
  });

  it('places a loan over 90 days past due in the last bucket', () => {
    expect(new ArrearsBucketService().of(91)).toBe(ArrearsBucket.OverNinetyDays);
  });
});
