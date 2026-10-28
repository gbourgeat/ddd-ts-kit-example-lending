import type { RelationTuple } from '@ddd-ts-kit/auth/rebac';
import type { IntegrationEvent, IntegrationEventSubscriber, JobRun } from '@ddd-ts-kit/kernel';
import { createHttpClient, settled, type HttpClient, type SettledOptions } from '@ddd-ts-kit/testing/e2e';
import { SimulatedScreeningProvider } from '@/contexts/customer-due-diligence/infrastructure/external/simulated-screening-provider.adapter';
import { customerDueDiligenceModule } from '@/contexts/customer-due-diligence/customer-due-diligence.module';
import { brokerageModule } from '@/contexts/brokerage/brokerage.module';
import { FakeIntermediariesRegister } from '@/contexts/brokerage/test/fakes/intermediaries-register.fake';
import { creditApplicationModule } from '@/contexts/credit-application/credit-application.module';
import { SimulatedRepaymentIncidentRegister } from '@/contexts/credit-application/assessment/infrastructure/external/simulated-repayment-incident-register.adapter';
import { servicingModule } from '@/contexts/servicing/servicing.module';
import { SimulatedBorrowerNotifier } from '@/contexts/servicing/arrears/infrastructure/external/simulated-borrower-notifier.adapter';
import { identityModule } from '@/contexts/identity/identity.module';
import { FakeIdentityProviderAdmin } from '@/contexts/identity/test/fakes/identity-provider-admin.fake';
import { composeApplication, everyContext, type ApplicationOptions } from '@/platform/composition/compose-application';
import type { Platform } from '@/platform/composition/platform';
import type { AppConfig } from '@/platform/config/app-config';
import type { Persistence } from '@/platform/database/persistence';
import { loadConfig } from '@/platform/config/load-config';
import { openTestDatabase, type TestDatabase } from '@/platform/database/open-test-database';
import { relateSystemActors } from '@/platform/auth/relationships/relate-system-actors';
import { createEventProvider } from '@/platform/events/create-event-provider';
import type { EventProvider } from '@/platform/events/event-provider';
import { inProcessEvents } from '@/platform/events/in-process-events';
import { startOutboxRelay } from '@/platform/events/start-outbox-relay';
import { startHttpServer } from '@/platform/http/start-http-server';
import { openRedis } from '@/platform/redis/open-redis';
import { createCredentials, type Credentials, type TestActor } from '$test/e2e/support/create-credentials';
import { noBroker, noRedis, testEnvironment } from '$test/e2e/support/test-environment';

/** The whole application, real adapters included, as a client and another context see it. */
export interface RunningApplication {
  readonly client: HttpClient;
  /** Subscribe here (`collectEvents`) to assert the integration events the application publishes. */
  readonly events: IntegrationEventSubscriber;
  /** The screening provider of the application: a spec lists the people the screening matches with `screening.record(name, birthDate)`. */
  readonly screening: SimulatedScreeningProvider;
  /** The persistence of the application's database: a spec reads what a use case stored through it, never by a route. */
  readonly persistence: Persistence;

  /** A client presenting the credential of `actor`; `client` itself presents none. */
  as(actor: TestActor): Promise<HttpClient>;

  /**
   * Publishes integration events of an upstream as its relay would, to the handlers of the
   * application: what starts a use case no route reaches. Await `settled()` next, before asserting
   * what the handlers did.
   * With a broker server (its URL in the environment), the events go to the broker: what its
   * consumers do is awaited with `collectEvents(application.events, [...]).waitFor(...)`.
   */
  publish(events: readonly IntegrationEvent[]): Promise<void>;

  /**
   * Resolves once the work the requests so far started has settled: every event stored in the
   * outbox relayed, and the handlers it reached run, with what they stored in turn. Await it
   * before asserting what happens after the answer, instead of waiting a fixed time; it fails
   * after `timeoutMs` (2 seconds by default) naming what is still pending, and how much of it
   * failed and waits for a retry (a handler that throws, an adapter that cannot be reached).
   * With a broker server (its URL in the environment), relayed means handed to the broker: what
   * its consumers do next is awaited with `collectEvents(application.events, [...]).waitFor(...)`.
   */
  settled(options?: SettledOptions): Promise<void>;

  /** Stores a relationship, as the application does when an element is created or shared. */
  relate(tuple: RelationTuple): Promise<void>;

  /** The intermediaries register of brokerage: a spec revokes a registration with `register.revoke(number)`. */
  readonly register: FakeIntermediariesRegister;

  /** The national register of repayment incidents of credit-application: a spec lists a person with `incidents.record(name, birthDate)`. */
  readonly incidents: SimulatedRepaymentIncidentRegister;

  /** The messages the simulated borrower notifier of servicing sent: `notifier.messagesTo(name)`. */
  readonly notifier: SimulatedBorrowerNotifier;

  /** Runs a background job of the application now, by its name (`brokerage.check-registration`). */
  runJob(name: string): Promise<unknown>;

  /** Empties the database: call it before each test. */
  reset(): Promise<void>;

  close(): Promise<void>;
}

/**
 * Starts the application on a free port. The database is PostgreSQL in process unless
 * DATABASE_URL names a migrated server (`npm run infra:up && npm run db:migrate`).
 */
export async function startApplication(): Promise<RunningApplication> {
  // An empty variable (a blank line of .env) means the same as none.
  const url = process.env['DATABASE_URL'] === '' ? undefined : process.env['DATABASE_URL'];
  const database = await openTestDatabase(url);
  const config = loadConfig(testEnvironment({ DATABASE_URL: url ?? 'postgres://in-process/tests' }));
  const credentials = await createCredentials();
  const screening = new SimulatedScreeningProvider();
  const register = new FakeIntermediariesRegister();
  const incidents = new SimulatedRepaymentIncidentRegister();
  const notifier = new SimulatedBorrowerNotifier();
  const started = await start({ database, config, credentials, screening, register, incidents, notifier });

  return {
    client: started.client,
    events: started.events,
    screening,
    register,
    incidents,
    notifier,
    runJob: (name) => started.runJob(name),
    persistence: database.persistence,
    as: async (actor) => started.client.withHeaders(await credentials.headersOf(actor)),
    publish: (events) => started.publish(events),
    relate: (tuple) => started.relate(tuple),
    settled: (options) => started.settled(options),
    reset: () => started.reset(),
    close: () => started.close(),
  };
}

interface Started {
  readonly client: HttpClient;
  readonly events: IntegrationEventSubscriber;

  publish(events: readonly IntegrationEvent[]): Promise<void>;

  relate(tuple: RelationTuple): Promise<void>;

  runJob(name: string): Promise<unknown>;

  settled(options?: SettledOptions): Promise<void>;

  /** Empties the database, then grants the system actors again: the reset removes their relationships too. */
  reset(): Promise<void>;

  close(): Promise<void>;
}

interface StartProps {
  readonly database: TestDatabase;
  readonly config: AppConfig;
  readonly credentials: Credentials;
  readonly screening: SimulatedScreeningProvider;
  readonly register: FakeIntermediariesRegister;
  readonly incidents: SimulatedRepaymentIncidentRegister;
  readonly notifier: SimulatedBorrowerNotifier;
}

/** The application on the test database, listening on a free port; closing it closes the database last. */
async function start({
  database,
  config,
  credentials,
  screening,
  register,
  incidents,
  notifier,
}: StartProps): Promise<Started> {
  const redis = config.redisUrl === noRedis ? undefined : openRedis(config);
  const selection = contextsWith(screening, register, incidents, notifier);

  const application = composeApplication(
    database.persistence,
    applicationOptions(config, credentials, redis),
    selection,
  );

  await application.start();
  await relateSystemActors(application.platform.relations);

  const relay = relayOf(database, application);

  const server = await startHttpServer(application, config);

  return {
    client: createHttpClient('http://127.0.0.1:' + server.port),
    events: application.eventSubscriber,
    publish: (events) => application.eventBus.publish(events),
    relate: (tuple) => application.platform.relations.write([tuple]),
    runJob: (name) => runJobOf(application, name),
    settled: (options) => settled({ outbox: () => database.persistence.outbox.stats() }, options),
    reset: async () => {
      await database.reset();
      await relateSystemActors(application.platform.relations);
    },
    close: async () => {
      await server.close();
      await relay.stop();
      await application.stop();
      await redis?.close();
      await database.close();
    },
  };
}

function applicationOptions(
  config: AppConfig,
  credentials: Credentials,
  redis: ReturnType<typeof openRedis> | undefined,
): ApplicationOptions {
  return {
    events: eventsOf(config),
    authenticator: credentials.authenticator,
    retention: config.retention,
    ...(redis === undefined ? {} : { redis }),
  };
}

/**
 * Every context of the application, with customer-due-diligence screening against the records the spec lists,
 * and brokerage's intermediaries register answered by the fake the spec drives.
 */
function contextsWith(
  screening: SimulatedScreeningProvider,
  register: FakeIntermediariesRegister,
  incidents: SimulatedRepaymentIncidentRegister,
  notifier: SimulatedBorrowerNotifier,
): typeof everyContext {
  return everyContext.map((context) => {
    if (context === customerDueDiligenceModule) {
      return (platform: Platform) => customerDueDiligenceModule(platform, screening);
    }

    if (context === brokerageModule) {
      return brokerageWithRegister(register);
    }

    if (context === creditApplicationModule) {
      return creditApplicationWithIncidents(incidents);
    }

    if (context === servicingModule) {
      return servicingWithNotifier(notifier);
    }

    if (context === identityModule) {
      return identityWithProviderFake(new FakeIdentityProviderAdmin());
    }

    return context;
  });
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

/** The credit application context as the application wires it, except that its register of repayment incidents is the one the spec drives. */
function creditApplicationWithIncidents(incidents: SimulatedRepaymentIncidentRegister) {
  return (platform: Platform): ReturnType<typeof creditApplicationModule> => {
    const adapter: Platform['adapter'] = (instance, info) => {
      if (info.token === 'RepaymentIncidentRegister') {
        return platform.adapter(incidents as unknown as typeof instance, info);
      }

      return platform.adapter(instance, info);
    };

    return creditApplicationModule({ ...platform, adapter });
  };
}

/** The servicing context as the application wires it, except that its borrower notifier is the one the spec reads. */
function servicingWithNotifier(notifier: SimulatedBorrowerNotifier) {
  return (platform: Platform): ReturnType<typeof servicingModule> => {
    const adapter: Platform['adapter'] = (instance, info) => {
      if (info.token === 'BorrowerNotifier') {
        return platform.adapter(notifier as unknown as typeof instance, info);
      }

      return platform.adapter(instance, info);
    };

    return servicingModule({ ...platform, adapter });
  };
}

/** The outbox relay of the application: what it stores is published, and the handlers it reaches run. */
function relayOf(database: TestDatabase, application: ReturnType<typeof composeApplication>) {
  return startOutboxRelay({
    store: database.persistence.outbox,
    publisher: application.eventBus,
    intervalMs: 20,
    logger: application.logger,
  });
}

/** The identity context as the application wires it, except that its identity provider is the fake (no Keycloak answers in a test). */
function identityWithProviderFake(provider: FakeIdentityProviderAdmin) {
  return (platform: Platform): ReturnType<typeof identityModule> => {
    const adapter: Platform['adapter'] = (instance, info) => {
      if (info.token === 'IdentityProviderAdmin') {
        return provider as unknown as typeof instance;
      }

      return platform.adapter(instance, info);
    };

    return identityModule({ ...platform, adapter });
  };
}

function eventsOf(config: AppConfig): EventProvider {
  return config.kafkaBrokers === noBroker ? inProcessEvents() : createEventProvider(config);
}

/** Runs a job now, as the scheduler would at its hour; a run that failed, did not happen or reached no tenant fails the spec. */
async function runJobOf(application: ReturnType<typeof composeApplication>, name: string): Promise<JobRun> {
  const run = await application.platform.jobs.runNow(name);
  const { outcome, errorCode, tenants } = run;

  if (outcome !== 'succeeded') {
    throw new Error(`The job ${name} ended ${outcome}${errorCode === undefined ? '' : ` (${errorCode})`}.`);
  }

  if (tenants === 0) {
    throw new Error(`The job ${name} is per-tenant and ran for no tenant: open a tenant first (an organisation).`);
  }

  return run;
}
