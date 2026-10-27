import { definePermissions } from '@ddd-ts-kit/auth';

export const creditPolicyPermissions = definePermissions('credit-policy', {
  // ddd-ts-kit:permissions
  'rate-grid.publish': { description: 'Publish rate grid' },
  'product.define': { description: 'Define product' },
  'legal-maximum-rate.publish': { description: 'Publish legal maximum rate' },
  // /ddd-ts-kit:permissions
});
