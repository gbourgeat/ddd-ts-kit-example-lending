import { auditPermissions } from '@/platform/audit/audit.permissions';

/**
 * The audit stream of financial crime: its entries go to a chain of their own, and only the
 * operators of the context (compliance) hold the permission that reads them.
 */
export const financialCrimeStream = {
  context: 'financial-crime',
  permission: auditPermissions['stream.financial-crime.read'],
  resource: { type: 'context', id: 'financial-crime' },
} as const;
