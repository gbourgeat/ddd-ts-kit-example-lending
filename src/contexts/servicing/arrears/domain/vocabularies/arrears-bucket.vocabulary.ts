export const ArrearsBucket = {
  None: 'None',
  OneToThirtyDays: 'OneToThirtyDays',
  ThirtyOneToSixtyDays: 'ThirtyOneToSixtyDays',
  SixtyOneToNinetyDays: 'SixtyOneToNinetyDays',
  OverNinetyDays: 'OverNinetyDays',
} as const;

export type ArrearsBucket = (typeof ArrearsBucket)[keyof typeof ArrearsBucket];
