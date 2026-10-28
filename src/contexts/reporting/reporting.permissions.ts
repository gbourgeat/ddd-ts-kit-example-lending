import { definePermissions } from '@ddd-ts-kit/auth';

export const reportingPermissions = definePermissions('reporting', {
  // ddd-ts-kit:permissions
  'report.portfolio-at-risk': { description: 'Portfolio at risk per branch' },
  'report.defaults': { description: 'Defaulted loans' },
  // /ddd-ts-kit:permissions
});
