import {
  ArrearsBucket,
  type ArrearsBucket as ArrearsBucketValue,
} from '@/contexts/servicing/arrears/domain/vocabularies/arrears-bucket.vocabulary';

const STAGE_NOTICES: Record<ArrearsBucketValue, string> = {
  [ArrearsBucket.None]: 'Your loan is no longer in arrears.',
  [ArrearsBucket.OneToThirtyDays]: 'Your loan is in arrears: 1 to 30 days past due.',
  [ArrearsBucket.ThirtyOneToSixtyDays]: 'Your loan is in arrears: 31 to 60 days past due.',
  [ArrearsBucket.SixtyOneToNinetyDays]: 'Your loan is in arrears: 61 to 90 days past due.',
  [ArrearsBucket.OverNinetyDays]: 'Your loan is in arrears: over 90 days past due.',
};

/** The notice of the arrears stage a loan entered: the text the borrower gets by mail and by text message. */
export function stageNoticeMessage(bucket: ArrearsBucketValue): string {
  return STAGE_NOTICES[bucket];
}
