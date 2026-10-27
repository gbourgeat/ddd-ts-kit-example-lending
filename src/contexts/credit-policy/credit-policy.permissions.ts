import { definePermissions } from '@ddd-ts-kit/auth';

export const creditPolicyPermissions = definePermissions('credit-policy', {
  // ddd-ts-kit:permissions
  'rate-grid.publish': { description: 'Publish rate grid' },
  'product.define': { description: 'Define product' },
  // /ddd-ts-kit:permissions
});
