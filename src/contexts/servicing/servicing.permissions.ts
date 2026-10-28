import { definePermissions } from '@ddd-ts-kit/auth';

export const servicingPermissions = definePermissions('servicing', {
  // ddd-ts-kit:permissions
  'loan.erase-past-retention': { description: 'Erase personal data past retention' },
  'loan.close': { description: 'Close loan' },
  'loan.record-payout': { description: 'Record payout' },
  'loan.read': { description: 'Read loan' },
  'loan.compute-due': { description: 'Compute due instalments' },
  // /ddd-ts-kit:permissions
});
