import { LOG_LEVELS, isTenantId } from '@ddd-ts-kit/kernel';
import type { AppConfig } from '@/platform/config/app-config';
import { Environment, type Variables } from '@/platform/config/environment';
import { readFiles } from '@/platform/config/read-files';
import { readTracing } from '@/platform/config/read-tracing';
import { readRetentionPeriods } from '@/platform/config/read-retention-periods';

const environments = ['development', 'test', 'production'] as const;

/** Whether a process runs the scheduled jobs when `RUN_JOBS` does not say. `ddd-ts-kit generate worker` turns it off: the worker then runs them. */
// ddd-ts-kit:run-jobs
const runJobsByDefault = true;
// /ddd-ts-kit:run-jobs

/**
 * Fails fast: every problem is collected and reported at once, by variable name only
 * (values may be secrets), before anything starts listening.
 */
export function loadConfig(variables: Variables): AppConfig {
  const env = new Environment(variables);
  const environment = env.oneOf('NODE_ENV', environments, 'development');

  const config: AppConfig = {
    serviceName: env.optional('OTEL_SERVICE_NAME') ?? 'lending',
    deploymentName: env.optional('DEPLOYMENT_NAME') ?? 'lending',
    serviceVersion: env.optional('SERVICE_VERSION') ?? '0.0.0',
    environment,
    port: env.integer('PORT', { fallback: 3000, min: 0, max: 65535 }),
    log: readLog(env),
    tracing: readTracing(env),
    resilience: readResilience(env),
    runJobs: env.flag('RUN_JOBS', runJobsByDefault),
    tenants: readTenants(env),
    databaseUrl: env.url('DATABASE_URL'),
    outboxRelayIntervalMs: env.integer('OUTBOX_RELAY_INTERVAL_MS', { fallback: 500, min: 10, max: 60000 }),
    docsEnabled: env.flag('API_DOCS', environment !== 'production'),
    kafkaBrokers: env.text('KAFKA_BROKERS'),
    keycloak: readKeycloak(env),
    redisUrl: env.url('REDIS_URL'),
    rateLimit: readRateLimit(env),
    errorReporting: readErrorReporting(env, environment),
    files: readFiles(env),
    retention: readRetentionPeriods(env),
  };

  env.assertValid();

  return config;
}

/** `TENANTS=acme,globex`: each id in the grammar of a tenant id. */
function readTenants(env: Environment): readonly string[] {
  const tenants = (env.optional('TENANTS') ?? '')
    .split(',')
    .map((tenant) => tenant.trim())
    .filter((tenant) => tenant !== '');

  if (!tenants.every(isTenantId)) {
    env.problem('TENANTS must list tenant ids: letters, digits, _ and -, at most 63 characters each');
  }

  return tenants;
}

function readLog(env: Environment): AppConfig['log'] {
  return {
    level: env.oneOf('LOG_LEVEL', LOG_LEVELS, 'info'),
    format: env.oneOf('LOG_FORMAT', ['json', 'pretty'], 'json'),
    scrubMessages: env.flag('LOG_SCRUB_MESSAGES', false),
  };
}

function readResilience(env: Environment): AppConfig['resilience'] {
  return {
    retryAttempts: env.integer('OUTBOUND_RETRY_ATTEMPTS', { fallback: 3, min: 1, max: 10 }),
    retryBaseDelayMs: env.integer('OUTBOUND_RETRY_BASE_DELAY_MS', { fallback: 100, min: 1, max: 60000 }),
    timeoutMs: env.integer('OUTBOUND_TIMEOUT_MS', { fallback: 2000, min: 1, max: 600000 }),
  };
}

function readRateLimit(env: Environment): AppConfig['rateLimit'] {
  return {
    limit: env.integer('RATE_LIMIT_MAX', { fallback: 120, min: 1, max: 1000000 }),
    windowMs: env.integer('RATE_LIMIT_WINDOW_MS', { fallback: 60000, min: 100, max: 3600000 }),
  };
}

/** An empty `SENTRY_DSN` is a choice, not a problem: the application starts and reports nothing. */
function readErrorReporting(env: Environment, environment: string): AppConfig['errorReporting'] {
  const dsn = env.optionalUrl('SENTRY_DSN', 'to report nothing');
  const release = env.optional('SENTRY_RELEASE');

  return {
    ...(dsn === undefined ? {} : { dsn }),
    environment: env.optional('SENTRY_ENVIRONMENT') ?? environment,
    ...(release === undefined ? {} : { release }),
    scrubMessages: env.flag('SENTRY_SCRUB_MESSAGES', false),
  };
}

function readKeycloak(env: Environment): AppConfig['keycloak'] {
  const clientId = env.optional('KEYCLOAK_CLIENT_ID');

  return {
    baseUrl: env.url('KEYCLOAK_URL'),
    realm: env.text('KEYCLOAK_REALM'),
    audience: env.text('KEYCLOAK_AUDIENCE'),
    ...(clientId === undefined ? {} : { clientId }),
  };
}
