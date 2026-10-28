import { definePermissions } from '@ddd-ts-kit/auth';

export const reportingPermissions = definePermissions('reporting', {
  // ddd-ts-kit:permissions
  'report.portfolio-at-risk': { description: 'Portfolio at risk per branch' },
  'report.defaults': { description: 'Defaulted loans' },
  'report.monthly': { description: 'Monthly report' },
  // /ddd-ts-kit:permissions
});
