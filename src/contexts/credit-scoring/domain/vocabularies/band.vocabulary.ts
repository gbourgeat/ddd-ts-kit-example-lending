export const Band = {
  Green: 'green',
  Amber: 'amber',
  Red: 'red',
} as const;

export type Band = (typeof Band)[keyof typeof Band];
