import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import type { RelationTuple } from '@ddd-ts-kit/auth/rebac';
import { createHttpClient, expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { brokerageModule } from '@/contexts/brokerage/brokerage.module';
import { FakeIntermediariesRegister } from '@/contexts/brokerage/test/fakes/intermediaries-register.fake';
import { composeApplication, everyContext } from '@/platform/composition/compose-application';
import type { Platform } from '@/platform/composition/platform';
import type { AppConfig } from '@/platform/config/app-config';
import { loadConfig } from '@/platform/config/load-config';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';
import { createEventProvider } from '@/platform/events/create-event-provider';
import type { EventProvider } from '@/platform/events/event-provider';
import { inProcessEvents } from '@/platform/events/in-process-events';
import { startOutboxRelay } from '@/platform/events/start-outbox-relay';
import { startHttpServer } from '@/platform/http/start-http-server';
import { openRedis, type RedisServices } from '@/platform/redis/open-redis';
import { createCredentials, type Credentials, type TestActor } from '$test/e2e/support/create-credentials';
import { noBroker, noRedis, testEnvironment } from '$test/e2e/support/test-environment';
import { storyOf } from '$test/e2e/support/story-of';

const registration = { registrationNumber: 'REG-0001' };
const tenantId = 'acme-bank';

describe('Register broker, end to end', () => {
  const tracing = installTestTracing();
  let application: BrokerageApplication;

  beforeAll(async () => {
    application = await startBrokerageApplication();
  });

  afterAll(async () => {
    await application.close();
    tracing.uninstall();
  });

  beforeEach(async () => {
    await application.reset();
  });

  /** A person who is an operator of the brokerage context, as the administrators of the bank make them. */
  async function operator(): Promise<HttpClient> {
    await application.relate({ object: 'context:brokerage', relation: 'operator', subject: 'user:ada' });

    return application.as({ id: 'ada', roles: ['admin'], tenantId });
  }

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.post('/brokers', registration);

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold the permission', async () => {
    const stranger = await application.as({ id: 'stranger', tenantId });

    const response = await stranger.post('/brokers', registration);

    expectStatus(response, 403);
  });

  it('is one trace: the request, the use case and what it saves', async () => {
    const ada = await operator();

    application.register.markValid('REG-0001');

    const trace = await tracing.traceOf(async () => {
      expectStatus(await ada.post('/brokers', registration), 201);
    });

    // Exact on names and structure, and kept before the tests whose request leaves work behind (a relay still publishing would add its spans here).
    expectSpanTree(storyOf(trace), [
      {
        name: 'POST /brokers',
        kind: 'SERVER',
        children: [
          {
            name: 'command RegisterBrokerCommand',
            children: [
              { name: 'repository BrokerRepository.save' },
              {
                name: 'unit-of-work before-commit',
                children: [{ name: 'domain-event brokerage.broker.registered' }],
              },
            ],
          },
        ],
      },
    ]);
  });

  it('answers 201 with the new broker when the intermediaries register confirms the registration', async () => {
    const ada = await operator();

    application.register.markValid('REG-0001');

    const response = await ada.post('/brokers', registration);

    expectStatus(response, 201);
    expect(response.body).toMatchObject({ id: expect.any(String) });
  });

  it('asks the intermediaries register about the registration number the client sent', async () => {
    const ada = await operator();

    application.register.markValid('REG-0001');

    await ada.post('/brokers', registration);

    expect(application.register.asked).toContainEqual(expect.objectContaining({ registrationNumber: 'REG-0001' }));
  });

  it('answers the documented problem when the intermediaries register does not confirm the registration', async () => {
    const ada = await operator();

    const response = await ada.post('/brokers', { registrationNumber: 'REG-0404' });

    expectStatus(response, 422);
    expect(response.body).toMatchObject({ code: 'INVALID_BROKER_REGISTRATION' });
  });
});

/** The whole application over HTTP, with the intermediaries register of brokerage replaced by its fake. */
interface BrokerageApplication {
  readonly client: HttpClient;
  /** The outside register: the test marks the registrations valid, and reads what was asked of it. */
  readonly register: FakeIntermediariesRegister;
  as(actor: TestActor): Promise<HttpClient>;
  relate(tuple: RelationTuple): Promise<void>;
  reset(): Promise<void>;
  close(): Promise<void>;
}

interface Wiring {
  readonly database: TestDatabase;
  readonly config: AppConfig;
  readonly credentials: Credentials;
  readonly register: FakeIntermediariesRegister;
}

interface Running {
  readonly client: HttpClient;
  relate(tuple: RelationTuple): Promise<void>;
  close(): Promise<void>;
}

async function startBrokerageApplication(): Promise<BrokerageApplication> {
  const url = process.env['DATABASE_URL'] === '' ? undefined : process.env['DATABASE_URL'];
  const database = await openTestDatabase(url);
  const config = loadConfig(testEnvironment({ DATABASE_URL: url ?? 'postgres://in-process/tests' }));
  const credentials = await createCredentials();
  const register = new FakeIntermediariesRegister();
  const running = await start({ database, config, credentials, register });

  return {
    client: running.client,
    register,
    as: async (actor) => running.client.withHeaders(await credentials.headersOf(actor)),
    relate: (tuple) => running.relate(tuple),
    reset: () => database.reset(),
    close: () => running.close(),
  };
}

/** The application on the test database, listening on a free port, wired like `startApplication` with the fake register. */
async function start({ database, config, credentials, register }: Wiring): Promise<Running> {
  const redis = config.redisUrl === noRedis ? undefined : openRedis(config);

  const contexts = everyContext.map((module) =>
    module === brokerageModule ? brokerageWithRegister(register) : module,
  );

  const application = composeApplication(
    database.persistence,
    {
      events: eventsOf(config),
      authenticator: credentials.authenticator,
      ...(redis === undefined ? {} : { redis }),
    },
    contexts,
  );

  await application.start();

  const relay = startOutboxRelay({
    store: database.persistence.outbox,
    publisher: application.eventBus,
    intervalMs: 20,
    logger: application.logger,
  });

  const server = await startHttpServer(application, config);

  return {
    client: createHttpClient('http://127.0.0.1:' + server.port),
    relate: (tuple) => application.platform.relations.write([tuple]),
    close: () => stop({ server, relay, application, redis, database }),
  };
}

/** The brokerage context as the application wires it, except that its intermediaries register is the fake. */
function brokerageWithRegister(register: FakeIntermediariesRegister) {
  return (platform: Platform): ReturnType<typeof brokerageModule> => {
    const adapter: Platform['adapter'] = (instance, info) => {
      if (info.token === 'IntermediariesRegister') {
        return register as unknown as typeof instance;
      }

      return platform.adapter(instance, info);
    };

    return brokerageModule({ ...platform, adapter });
  };
}

async function stop(running: {
  server: { close(): Promise<void> };
  relay: { stop(): Promise<void> };
  application: { stop(): Promise<void> };
  redis: RedisServices | undefined;
  database: TestDatabase;
}): Promise<void> {
  await running.server.close();
  await running.relay.stop();
  await running.application.stop();
  await running.redis?.close();
  await running.database.close();
}

function eventsOf(config: AppConfig): EventProvider {
  return config.kafkaBrokers === noBroker ? inProcessEvents() : createEventProvider(config);
}
