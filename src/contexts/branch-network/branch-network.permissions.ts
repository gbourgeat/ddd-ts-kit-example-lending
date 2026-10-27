import { definePermissions } from '@ddd-ts-kit/auth';

export const branchNetworkPermissions = definePermissions('branch-network', {
  // ddd-ts-kit:permissions
  'branch.open': { description: 'Open branch' },
  'staff-member.appoint': { description: 'Appoint staff member' },
  'portfolio.open': { description: 'Open portfolio' },
  'staff-member.list': { description: 'Search branch staff' },
  // /ddd-ts-kit:permissions
});
