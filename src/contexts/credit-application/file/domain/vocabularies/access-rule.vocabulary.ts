export const AccessRule = {
  DeclaredConflict: 'declared-conflict',
  NotInPortfolio: 'not-in-portfolio',
  NotBroughtByYou: 'not-brought-by-you',
} as const;

export type AccessRule = (typeof AccessRule)[keyof typeof AccessRule];
