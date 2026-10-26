import { randomUUID } from 'node:crypto';
import os from 'node:os';
import { parseArgs } from 'node:util';
import { executionContext, type Actor } from '@ddd-ts-kit/kernel';
import { offlineAuthenticator } from '@/platform/auth/authentication/offline-authenticator';
import { composeApplication } from '@/platform/composition/compose-application';
import { loadConfig } from '@/platform/config/load-config';
import { openPersistence } from '@/platform/database/open-persistence';
import { inProcessEvents } from '@/platform/events/in-process-events';
import { runPurge } from '@/platform/privacy/run-purge';

// The storage limitation (GDPR, article 5(1)(e)), from the command line, as the job
// `privacy.purge-expired` runs it every night:
//   npm run privacy:purge [-- --operator <who-runs-it>]
// Every copy listed in src/platform/privacy/data-subject-copies.ts erases the rows that outlived the
// retention their declaration gives, as it says, in every tenant. The report says the rows each
// context reached; run again, a purge reaches nothing, and every run leaves its entry in the audit trail.
const { values } = parseArgs({ options: { operator: { type: 'string', default: os.userInfo().username } } });

const persistence = await openPersistence(loadConfig(process.env));

const application = composeApplication(persistence, {
  events: inProcessEvents(),
  authenticator: offlineAuthenticator,
});

const actor: Actor = { id: values.operator, type: 'user', roles: [], attributes: {} };
const context = executionContext({ correlationId: randomUUID(), actor, origin: 'cli' });

try {
  const report = await application.platform.scope.run(context, () => runPurge(application.platform));

  console.log(JSON.stringify(report, null, 2));
} finally {
  await application.stop();
  await persistence.close();
}
