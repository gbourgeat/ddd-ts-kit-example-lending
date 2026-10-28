import { definePermissions } from '@ddd-ts-kit/auth';

export const reportingPermissions = definePermissions('reporting', {
  // ddd-ts-kit:permissions
  'report.portfolio-at-risk': { description: 'Portfolio at risk per branch' },
  // /ddd-ts-kit:permissions
});
