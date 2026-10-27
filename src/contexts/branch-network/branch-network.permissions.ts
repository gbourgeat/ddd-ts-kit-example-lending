import { definePermissions } from '@ddd-ts-kit/auth';

export const branchNetworkPermissions = definePermissions('branch-network', {
  // ddd-ts-kit:permissions
  'branch.open': { description: 'Open branch' },
  'staff-member.appoint': { description: 'Appoint staff member' },
  'portfolio.open': { description: 'Open portfolio' },
  // /ddd-ts-kit:permissions
});
