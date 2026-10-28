import { definePermissions } from '@ddd-ts-kit/auth';

export const creditApplicationPermissions = definePermissions('credit-application', {
  // ddd-ts-kit:permissions
  'application.submit': { description: 'Submit application' },
  'application.consent': { description: 'Give account consent' },
  'application.read': { description: 'List applications' },
  'application.name-party': { description: 'Name co borrower' },
  'application.correct': { description: 'Correct entry' },
  'application.decide': { description: 'Decide an application: read its declared conflicts first' },
  'application.attach-document': { description: 'Attach document' },
  'application.read-accounts': { description: 'Read account information' },
  // /ddd-ts-kit:permissions
});
