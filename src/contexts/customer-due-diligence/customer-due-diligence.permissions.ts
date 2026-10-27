import { definePermissions } from '@ddd-ts-kit/auth';

export const customerDueDiligencePermissions = definePermissions('customer-due-diligence', {
  // ddd-ts-kit:permissions
  'business.register': { description: 'Register business' },
  'customer.identify': { description: 'Identify customer' },
  'business.declare-owners': { description: 'Declare directors and owners' },
  'customer.read': { description: 'Get customer file' },
  'customer.assign-advisor': { description: 'Assign advisor' },
  'customer.screen': { description: 'Screen customer' },
  // /ddd-ts-kit:permissions
});
