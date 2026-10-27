import { definePermissions } from '@ddd-ts-kit/auth';

export const financialCrimePermissions = definePermissions('financial-crime', {
  // ddd-ts-kit:permissions
  'alert.raise': { description: 'Raise alert' },
  'alert.close': { description: 'Close alert' },
  'report.file': { description: 'File suspicious activity report' },
  // /ddd-ts-kit:permissions
});
