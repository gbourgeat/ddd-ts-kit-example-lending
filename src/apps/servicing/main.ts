// Imported first on purpose: instrumentation has to be installed before any module it patches is loaded.
import { tracing } from '@/platform/observability/tracing';
// Imported second on purpose: a failure while the rest of the application loads is already reported.
import { errors } from '@/platform/observability/errors';
import { createAuthenticator } from '@/platform/auth/authentication/create-authenticator';
import { composeApplication } from '@/platform/composition/compose-application';
import { loadConfig } from '@/platform/config/load-config';
import { openPersistence } from '@/platform/database/open-persistence';
import { createEventProvider } from '@/platform/events/create-event-provider';
import { startOutboxRelay } from '@/platform/events/start-outbox-relay';
import { openFiles } from '@/platform/files/open-files';
import { startHttpServer } from '@/platform/http/start-http-server';
import { jobSettings } from '@/platform/jobs/job-settings';
import { openRedis } from '@/platform/redis/open-redis';
import { servicingModule } from '@/contexts/servicing/servicing.module';
// The context "servicing" alone, on the kernel and the platform: the same code as in the whole application, another composition root.
const config = loadConfig(process.env);
const persistence = await openPersistence(config);
const redis = openRedis(config);

const application = composeApplication(
  persistence,
  {
    events: createEventProvider(config, errors),
    errors,
    authenticator: createAuthenticator(config),
    log: { ...config.log, service: config.serviceName, environment: config.environment },
    traceConsumers: config.tracing.consumers,
    resilience: config.resilience,
    // A context run alone takes its jobs with it, and only its own: the jobs of the platform stay with the whole application.
    jobs: { start: config.runJobs, settings: jobSettings(process.env, 'servicing') },
    platformJobs: false,
    tenants: config.tenants,
    redis,
    files: openFiles(config.files),
  },
  [servicingModule],
);

await application.start();

const relay = startOutboxRelay({
  store: persistence.outbox,
  publisher: application.eventBus,
  intervalMs: config.outboxRelayIntervalMs,
  logger: application.logger,
  errors,
  wakeOn: redis.relaySignal,
});

const server = await startHttpServer(application, config);

application.logger.info('listening', { context: 'servicing', port: server.port });

process.once('SIGTERM', () => void shutdown());
process.once('SIGINT', () => void shutdown());

async function shutdown(): Promise<void> {
  await server.close();
  await relay.stop();
  await application.stop();
  await redis.close();
  await persistence.close();
  await tracing.shutdown();
}
