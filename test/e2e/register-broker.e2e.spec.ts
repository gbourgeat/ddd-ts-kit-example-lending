import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import type { RelationTuple } from '@ddd-ts-kit/auth/rebac';
import { createHttpClient, expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { brokerageModule } from '@/contexts/brokerage/brokerage.module';
import { FakeIntermediariesRegister } from '@/contexts/brokerage/test/fakes/intermediaries-register.fake';
import { relateSystemActors } from '@/platform/auth/relationships/relate-system-actors';
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
const dailyCheck = 'brokerage.check-registration';

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
    const ada = await operatorIn(application, tenantId);

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
    const ada = await operatorIn(application, tenantId);

    application.register.markValid('REG-0001');

    const response = await ada.post('/brokers', registration);

    expectStatus(response, 201);
    expect(response.body).toMatchObject({ id: expect.any(String) });
  });

  it('asks the intermediaries register about the registration number the client sent', async () => {
    const ada = await operatorIn(application, tenantId);

    application.register.markValid('REG-0001');

    await ada.post('/brokers', registration);

    expect(application.register.asked).toContainEqual(expect.objectContaining({ registrationNumber: 'REG-0001' }));
  });

  it('answers the documented problem when the intermediaries register does not confirm the registration', async () => {
    const ada = await operatorIn(application, tenantId);

    const response = await ada.post('/brokers', { registrationNumber: 'REG-0404' });

    expectStatus(response, 422);
    expect(response.body).toMatchObject({ code: 'INVALID_BROKER_REGISTRATION' });
  });
});

describe('The daily check of the registrations, end to end', () => {
  let application: BrokerageApplication;
  /** The bank the identity context opened: the tenant the check runs for, and the one the broker is registered in. */
  let bank: string;

  beforeAll(async () => {
    application = await startBrokerageApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();
    bank = await openBank(application);
  });

  /** A broker of the bank, registered while its registration is valid. */
  async function registeredBroker(): Promise<void> {
    const ada = await operatorIn(application, bank);

    application.register.markValid('REG-0001');
    expectStatus(await ada.post('/brokers', registration), 201);
  }

  it('marks as lapsed the broker whose registration is revoked: the check asks about it, then no longer', async () => {
    await registeredBroker();
    application.register.revoke('REG-0001');
    const askedBefore = application.register.asked.length;

    await application.runDailyCheck();
    const askedAfterFirstCheck = application.register.asked.length;

    expect(askedAfterFirstCheck).toBeGreaterThan(askedBefore);

    expect(application.register.asked.slice(askedBefore)).toContainEqual(
      expect.objectContaining({ registrationNumber: 'REG-0001' }),
    );

    await application.runDailyCheck();

    expect(application.register.asked.length).toBe(askedAfterFirstCheck);
  });

  it('keeps checking the broker whose registration is still valid, on each day', async () => {
    await registeredBroker();
    const askedBefore = application.register.asked.length;

    await application.runDailyCheck();
    const askedAfterFirstCheck = application.register.asked.length;

    expect(askedAfterFirstCheck).toBeGreaterThan(askedBefore);

    await application.runDailyCheck();

    expect(application.register.asked.length).toBeGreaterThan(askedAfterFirstCheck);
  });
});

/** The whole application over HTTP, with the intermediaries register of brokerage replaced by its fake. */
interface BrokerageApplication {
  readonly client: HttpClient;
  /** The outside register: the test marks the registrations valid, and reads what was asked of it. */
  readonly register: FakeIntermediariesRegister;
  as(actor: TestActor): Promise<HttpClient>;
  relate(tuple: RelationTuple): Promise<void>;
  runDailyCheck(): Promise<unknown>;
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
  runJob(name: string): Promise<unknown>;
  relateSystemActors(): Promise<void>;
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
    runDailyCheck: () => running.runJob(dailyCheck),
    reset: async () => {
      await database.reset();
      await running.relateSystemActors();
    },
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
    runJob: (name) => application.platform.jobs.runNow(name),
    relateSystemActors: () => relateSystemActors(application.platform.relations),
    close: () => stop({ server, relay, application, redis, database }),
  };
}

/** A person who is an operator of the brokerage context, acting in the tenant given. */
async function operatorIn(app: BrokerageApplication, tenant: string): Promise<HttpClient> {
  await app.relate({ object: 'context:brokerage', relation: 'operator', subject: 'user:ada' });

  return app.as({ id: 'ada', roles: ['admin'], tenantId: tenant });
}

/** A bank opened through the identity context, as an administrator opens it: its id is the tenant of the work. */
async function openBank(app: BrokerageApplication): Promise<string> {
  await app.relate({ object: 'context:identity', relation: 'operator', subject: 'user:ada' });
  const ada = await app.as({ id: 'ada', roles: ['admin'] });

  expectStatus(await ada.put('/accounts/me', {}), 200);
  const opened = await ada.post('/organisations', { slug: tenantId, name: 'Acme Bank' });

  expectStatus(opened, 201);

  return (opened.body as { id: string }).id;
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
