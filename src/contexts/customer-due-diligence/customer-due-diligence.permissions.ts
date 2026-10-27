import { definePermissions } from '@ddd-ts-kit/auth';

export const customerDueDiligencePermissions = definePermissions('customer-due-diligence', {
  // ddd-ts-kit:permissions
  'business.register': { description: 'Register business' },
  'customer.identify': { description: 'Identify customer' },
  // /ddd-ts-kit:permissions
});
