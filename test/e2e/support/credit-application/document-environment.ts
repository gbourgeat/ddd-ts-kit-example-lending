import type { RelationTuple } from '@ddd-ts-kit/auth/rebac';
import { InMemoryFileStorage } from '@ddd-ts-kit/kernel';
import { createHttpClient, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { composeApplication } from '@/platform/composition/compose-application';
import { loadConfig } from '@/platform/config/load-config';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';
import type { Persistence } from '@/platform/database/persistence';
import { inProcessEvents } from '@/platform/events/in-process-events';
import { startHttpServer } from '@/platform/http/start-http-server';
import { createCredentials, type TestActor } from '$test/e2e/support/create-credentials';
import { testEnvironment } from '$test/e2e/support/test-environment';

/** The application over HTTP, its files in an object store the spec holds, and the stores read beside it. */
export interface DocumentEnvironment {
  readonly client: HttpClient;
  /** The object store of the application: what an upload stores is read here, the content and its metadata. */
  readonly storage: InMemoryFileStorage;
  /** The real stores of the test database: what the application wrote is read here, never through the application. */
  readonly persistence: Persistence;

  /** A client presenting the credential of `actor`. */
  as(actor: TestActor): Promise<HttpClient>;

  /** Stores a relationship, as the application does when an element is created or shared. */
  relate(tuple: RelationTuple): Promise<void>;

  /** Empties the database and the object store: call it before each test. */
  reset(): Promise<void>;

  close(): Promise<void>;
}

/** Starts the whole application on the test database, its files in a memory the environment holds. */
export async function startDocumentEnvironment(): Promise<DocumentEnvironment> {
  const database: TestDatabase = await openTestDatabase();
  const config = loadConfig(testEnvironment({ DATABASE_URL: 'postgres://in-process/tests' }));
  const credentials = await createCredentials();
  const storage = new InMemoryFileStorage();

  const application = composeApplication(database.persistence, {
    events: inProcessEvents(),
    authenticator: credentials.authenticator,
    files: storage,
  });

  await application.start();

  const server = await startHttpServer(application, config);
  const client = createHttpClient('http://127.0.0.1:' + server.port);

  return {
    client,
    storage,
    persistence: database.persistence,
    as: async (actor) => client.withHeaders(await credentials.headersOf(actor)),
    relate: (tuple) => application.platform.relations.write([tuple]),
    reset: async () => {
      await database.reset();

      for (const key of storage.keys()) {
        await storage.delete(key);
      }
    },
    close: async () => {
      await server.close();
      await application.stop();
      await database.close();
    },
  };
}
