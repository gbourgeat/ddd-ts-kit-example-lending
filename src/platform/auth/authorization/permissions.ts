import { PermissionRegistry } from '@ddd-ts-kit/auth';
import { auditPermissions } from '@/platform/audit/audit.permissions';
// ddd-ts-kit:imports
// /ddd-ts-kit:imports

/** Every permission of every context, and the one of the audit trail: the authorization model is laid out over it. */
export const permissions = PermissionRegistry.of(
  auditPermissions,
  // ddd-ts-kit:permission-sets
  // /ddd-ts-kit:permission-sets
);
