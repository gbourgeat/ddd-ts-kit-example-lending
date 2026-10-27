import { definePermissions } from '@ddd-ts-kit/auth';

export const branchNetworkPermissions = definePermissions('branch-network', {
  // ddd-ts-kit:permissions
  'branch.open': { description: 'Open branch' },
  'staff-member.appoint': { description: 'Appoint staff member' },
  'portfolio.open': { description: 'Open portfolio' },
  'staff-member.list': { description: 'Search branch staff' },
  'conflict.declare': { description: 'Declare conflict of interest' },
  'portfolio.assign-customer': { description: 'Assign customer' },
  'portfolio.search-customers': { description: 'Search portfolio customers' },
  // /ddd-ts-kit:permissions
});
