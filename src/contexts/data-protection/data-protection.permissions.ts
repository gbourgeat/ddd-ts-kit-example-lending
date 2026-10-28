import { definePermissions } from '@ddd-ts-kit/auth';

export const dataProtectionPermissions = definePermissions('data-protection', {
  // ddd-ts-kit:permissions
  'data.erase': { description: 'Erase personal data past retention' },
  'data-subject.request-copy': { description: 'Request personal data copy' },
  'impact-assessment.record': { description: 'Record scoring impact assessment' },
  // /ddd-ts-kit:permissions
});
