import type { RelationTuple } from '@ddd-ts-kit/auth/rebac';
import type { OutboxStore } from '@ddd-ts-kit/events';
import { createHttpClient, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { composeApplication } from '@/platform/composition/compose-application';
import { loadConfig } from '@/platform/config/load-config';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';
import type { Persistence } from '@/platform/database/persistence';
import { inProcessEvents } from '@/platform/events/in-process-events';
import { startHttpServer } from '@/platform/http/start-http-server';
import { createCredentials, type TestActor } from '$test/e2e/support/create-credentials';
import { testEnvironment } from '$test/e2e/support/test-environment';

/** `available`: the outbox stores what it is given. `refusing`: every append fails, after the application is recorded. */
export type OutboxBehaviour = 'available' | 'refusing';

/** The application over HTTP on the test database, and the stores read beside it as the database holds them. */
export interface SubmissionEnvironment {
  readonly client: HttpClient;
  /** The real stores of the test database: what the application wrote is read here, never through the application. */
  readonly persistence: Persistence;

  /** A client presenting the credential of `actor`. */
  as(actor: TestActor): Promise<HttpClient>;

  /** Stores a relationship, as the application does when an element is created or shared. */
  relate(tuple: RelationTuple): Promise<void>;

  /** Empties the database: call it before each test. */
  reset(): Promise<void>;

  close(): Promise<void>;
}

/** Starts the application with the outbox of the test database, or with one that refuses every append. */
export async function startSubmissionEnvironment(outbox: OutboxBehaviour): Promise<SubmissionEnvironment> {
  const database: TestDatabase = await openTestDatabase();
  const config = loadConfig(testEnvironment({ DATABASE_URL: 'postgres://in-process/tests' }));
  const credentials = await createCredentials();
  const persistence = outbox === 'refusing' ? withRefusingOutbox(database.persistence) : database.persistence;

  const application = composeApplication(persistence, {
    events: inProcessEvents(),
    authenticator: credentials.authenticator,
  });

  await application.start();

  const server = await startHttpServer(application, config);
  const client = createHttpClient('http://127.0.0.1:' + server.port);

  return {
    client,
    persistence: database.persistence,
    as: async (actor) => client.withHeaders(await credentials.headersOf(actor)),
    relate: (tuple) => application.platform.relations.write([tuple]),
    reset: () => database.reset(),
    close: async () => {
      await server.close();
      await application.stop();
      await database.close();
    },
  };
}

/** The same persistence, except that its outbox refuses to append: the failure comes once the application is recorded. */
function withRefusingOutbox(persistence: Persistence): Persistence {
  const refusing: OutboxStore = Object.create(persistence.outbox, {
    append: { value: () => Promise.reject(new Error('the outbox refuses the append')) },
  });

  return { ...persistence, outbox: refusing };
}
