import { definePermissions } from '@ddd-ts-kit/auth';

export const brokeragePermissions = definePermissions('brokerage', {
  // ddd-ts-kit:permissions
  'broker.register': { description: 'Register broker' },
  'broker.check': { description: 'Check registration' },
  // /ddd-ts-kit:permissions
});
