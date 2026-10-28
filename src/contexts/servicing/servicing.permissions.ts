import { definePermissions } from '@ddd-ts-kit/auth';

export const servicingPermissions = definePermissions('servicing', {
  // ddd-ts-kit:permissions
  'loan.erase-past-retention': { description: 'Erase personal data past retention' },
  'loan.close': { description: 'Close loan' },
  // /ddd-ts-kit:permissions
});
