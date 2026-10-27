import { definePermissions } from '@ddd-ts-kit/auth';

export const creditPolicyPermissions = definePermissions('credit-policy', {
  // ddd-ts-kit:permissions
  'rate-grid.publish': { description: 'Publish rate grid' },
  'product.define': { description: 'Define product' },
  'legal-maximum-rate.publish': { description: 'Publish legal maximum rate' },
  'delegation-table.set': { description: 'Set delegation table' },
  'residual-income-minimum.set': { description: 'Set residual income minimum' },
  // /ddd-ts-kit:permissions
});
