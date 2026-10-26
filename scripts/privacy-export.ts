import { randomUUID } from 'node:crypto';
import os from 'node:os';
import { parseArgs } from 'node:util';
import { offlineAuthenticator } from '@/platform/auth/authentication/offline-authenticator';
import { composeApplication } from '@/platform/composition/compose-application';
import { loadConfig } from '@/platform/config/load-config';
import { openPersistence } from '@/platform/database/open-persistence';
import { tenantDirectory } from '@/platform/composition/tenant-directory';
import { inProcessEvents } from '@/platform/events/in-process-events';
import { runExport } from '@/platform/privacy/run-export';

// The right of access and to portability of one data subject (GDPR, articles 15 and 20), from the
// command line:
//   npm run privacy:export -- <subject-id> [--operator <who-asks>] > export.json
// One JSON document on the standard output (`format`, `subject`, `exportedAt`, `records`): every
// record each context declared in src/platform/privacy/data-subject-exports.ts keeps of the
// person, in each tenant the tenant directory lists (TENANTS, or the organisations of the identity context), as plain data. Hand it over to the person, then delete
// the file; the audit trail keeps the entry of each export, never the values. Every run is a
// handover and leaves its entry, a trial included: try it on a test subject, never on a real person.
// What this script cannot reach: the stored events (read them through the aggregate), backups,
// logs and the copies no context declared.
const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { operator: { type: 'string', default: os.userInfo().username } },
});

const [subject] = positionals;

if (subject === undefined || positionals.length > 1) {
  console.error('Usage: npm run privacy:export -- <subject-id> [--operator <who-asks>]');
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
    'The tenant directory lists no tenant to gather the records in. Name them in TENANTS, comma separated, or open an organisation first.',
  );

  await application.stop();
  await persistence.close();
  process.exit(2);
}

try {
  const document = await runExport(subject, {
    platform: application.platform,
    operator: values.operator,
    correlationId: randomUUID(),
    tenants,
  });

  console.log(JSON.stringify(document, null, 2));
} finally {
  await application.stop();
  await persistence.close();
}
