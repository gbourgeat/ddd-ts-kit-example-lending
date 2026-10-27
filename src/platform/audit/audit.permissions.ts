import { definePermissions } from '@ddd-ts-kit/auth';

/** Reading the trail is itself a sensitive act: one permission, and every allowed read is recorded. */
export const auditPermissions = definePermissions('audit', {
  'trail.read': { description: 'Read the audit trail' },
  'stream.financial-crime.read': { description: 'Read the audit stream of financial crime, compliance only' },
});
