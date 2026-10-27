import { definePermissions } from '@ddd-ts-kit/auth';

export const creditApplicationPermissions = definePermissions('credit-application', {
  // ddd-ts-kit:permissions
  'application.submit': { description: 'Submit application' },
  'application.consent': { description: 'Give account consent' },
  'application.read': { description: 'List applications' },
  // /ddd-ts-kit:permissions
});
