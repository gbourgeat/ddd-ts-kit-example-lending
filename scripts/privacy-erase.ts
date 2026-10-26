import { randomUUID } from 'node:crypto';
import os from 'node:os';
import { parseArgs } from 'node:util';
import { offlineAuthenticator } from '@/platform/auth/authentication/offline-authenticator';
import { composeApplication } from '@/platform/composition/compose-application';
import { loadConfig } from '@/platform/config/load-config';
import { openPersistence } from '@/platform/database/open-persistence';
import { tenantDirectory } from '@/platform/composition/tenant-directory';
import { inProcessEvents } from '@/platform/events/in-process-events';
import { runErasure } from '@/platform/privacy/run-erasure';

// The right to erasure of one data subject (GDPR, article 17), from the command line:
//   npm run privacy:erase -- <subject-id> [--operator <who-asks>]
// The key of the subject is destroyed first, so every personal value of its stored events reads as
// erased, and the erasure leaves a dated entry in the audit trail; then every copy a context declared in
// src/platform/privacy/data-subject-copies.ts is erased, in each tenant the tenant directory lists (TENANTS, or the organisations of the identity context).
// The report says what was reached. Running it again completes an erasure that failed half way.
// What this script cannot reach: backups, logs, exports and the copies no context declared.
const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { operator: { type: 'string', default: os.userInfo().username } },
});

const [subject] = positionals;

if (subject === undefined || positionals.length > 1) {
  console.error('Usage: npm run privacy:erase -- <subject-id> [--operator <who-asks>]');
  process.exit(2);
}

// The tenants of a project with no source of tenants (comma separated); the identity preset reads its organisations instead.
const fixedTenants = (process.env['TENANTS'] ?? '')
  .split(',')
  .map((tenant) => tenant.trim())
  .filter((tenant) => tenant !== '');

const persistence = await openPersistence(loadConfig(process.env));

const application = composeApplication(persistence, {
  events: inProcessEvents(),
  authenticator: offlineAuthenticator,
});

const tenants = await tenantDirectory(persistence, fixedTenants).tenants();

if (tenants.length === 0) {
  console.error(
    'The tenant directory lists no tenant: a write of tenant data is never widened. Name them in TENANTS, comma separated, or open an organisation first.',
  );

  await application.stop();
  await persistence.close();
  process.exit(2);
}

try {
  const report = await runErasure(subject, {
    platform: application.platform,
    operator: values.operator,
    correlationId: randomUUID(),
    tenants,
  });

  console.log(JSON.stringify(report, null, 2));
} finally {
  await application.stop();
  await persistence.close();
}
