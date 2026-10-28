import { expect } from '@jest/globals';
import type { RunningApplication } from '$test/e2e/support/start-application';

/**
 * The command a per-tenant job sent for a bank is audited with that bank and the system actor of the job: the same
 * command name exists in several contexts, so the entry is read by its tenant and its actor, never by the name alone.
 */
export async function expectJobAuditedFor(app: RunningApplication, job: string, tenantId: string): Promise<void> {
  const entries = await app.persistence.database
    .client()
    .auditEntry.findMany({ where: { category: 'command', actorId: `system:${job}`, tenantId } });

  expect(entries.length).toBeGreaterThanOrEqual(1);
  expect(entries.map((entry) => entry.outcome)).toContain('succeeded');
}
