import { definePermissions } from '@ddd-ts-kit/auth';

export const customerDueDiligencePermissions = definePermissions('customer-due-diligence', {
  // ddd-ts-kit:permissions
  'business.register': { description: 'Register business' },
  'customer.identify': { description: 'Identify customer' },
  'business.declare-owners': { description: 'Declare directors and owners' },
  'customer.read': { description: 'Get customer file' },
  'customer.assign-advisor': { description: 'Assign advisor' },
  'customer.screen': { description: 'Screen customer' },
  'match.confirm': { description: 'Confirm sanctions match' },
  'relationship.end': { description: 'End relationship' },
  'match.dismiss': { description: 'Dismiss match' },
  'customer.rate-risk': { description: 'Rate customer risk' },
  'customer.read-risk': { description: 'Get customer risk rating' },
  // /ddd-ts-kit:permissions
});
