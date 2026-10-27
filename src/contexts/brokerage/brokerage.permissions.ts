import { definePermissions } from '@ddd-ts-kit/auth';

export const brokeragePermissions = definePermissions('brokerage', {
  // ddd-ts-kit:permissions
  'broker.register': { description: 'Register broker' },
  // /ddd-ts-kit:permissions
});
