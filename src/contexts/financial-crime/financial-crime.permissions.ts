import { definePermissions } from '@ddd-ts-kit/auth';

export const financialCrimePermissions = definePermissions('financial-crime', {
  // ddd-ts-kit:permissions
  'alert.raise': { description: 'Raise alert' },
  'alert.close': { description: 'Close alert' },
  // /ddd-ts-kit:permissions
});
