import { definePermissions } from '@ddd-ts-kit/auth';

export const dataProtectionPermissions = definePermissions('data-protection', {
  // ddd-ts-kit:permissions
  'data.erase': { description: 'Erase personal data past retention' },
  // /ddd-ts-kit:permissions
});
