import type { LogLevel, RateLimit } from '@ddd-ts-kit/kernel';
import type { ResilienceSettings } from '@/platform/resilience/resilience-settings';
import type { FilesConfig } from '@/platform/config/read-files';
import type { TracingConfig } from '@/platform/config/read-tracing';
import type { RetentionPeriods } from '@/platform/config/read-retention-periods';

/** The validated configuration of the process: `loadConfig` is the only reader of the environment. */
export interface AppConfig {
  /** What this process is called in traces and logs (`OTEL_SERVICE_NAME`): one per container, so it tells the processes of a deployment apart. */
  readonly serviceName: string;
  /** What the processes of one deployment share (`DEPLOYMENT_NAME`, the name of the project when left out): the namespace of the keys they exchange through the server, never `serviceName`. */
  readonly deploymentName: string;
  readonly serviceVersion: string;
  readonly environment: 'development' | 'test' | 'production';
  readonly port: number;
  readonly log: LogConfig;
  /** What `tracing.ts` starts with, and whether a consumed event continues the trace of its publication. */
  readonly tracing: TracingConfig;
  /** The policy around every adapter that leaves the process (kinds `external` and `gateway`). */
  readonly resilience: ResilienceSettings;
  /** Whether this process runs the scheduled jobs (`RUN_JOBS`): off for the API of a project that has a worker. */
  readonly runJobs: boolean;
  /** The tenants that exist (`TENANTS`, comma separated): a job declared `per-tenant` runs once for each. Read once at the start: a tenant created later is missed. Once the tenants live in a table, make `composition/tenant-directory.ts` read it (the identity preset does). */
  readonly tenants: readonly string[];
  readonly databaseUrl: string;
  readonly outboxRelayIntervalMs: number;
  readonly docsEnabled: boolean;
  readonly keycloak: KeycloakConfig;
  readonly kafkaBrokers: string;
  readonly redisUrl: string;
  /** How many requests one caller address may send in a sliding window, before the HTTP layer answers 429. */
  readonly rateLimit: RateLimit;
  /** Where unexpected failures are reported: a Sentry or a GlitchTip project. Without a DSN nothing is reported. */
  readonly errorReporting: ErrorReportingConfig;
  /** Where the content of files lives (`files/open-files.ts`), never in the database. */
  readonly files: FilesConfig;
  /** How long each copy of personal data is kept (`RETENTION_PERIODS`): the nightly erasure acts on these, owned by data-protection. */
  readonly retention: RetentionPeriods;
}

/** `LOG_LEVEL`, `LOG_FORMAT` and `LOG_SCRUB_MESSAGES`. */
interface LogConfig {
  readonly level: LogLevel;
  /** `json` everywhere; `pretty` on a developer's machine only. */
  readonly format: 'json' | 'pretty';
  /** Writes `[message removed]` for the message of every logged error that is not a `DomainError`: for logs that leave your hands. */
  readonly scrubMessages: boolean;
}

/** What `initSentry` is given: `SENTRY_DSN`, `SENTRY_ENVIRONMENT` (the one of `NODE_ENV` when left out), `SENTRY_RELEASE` and `SENTRY_SCRUB_MESSAGES`. */
interface ErrorReportingConfig {
  readonly dsn?: string;
  readonly environment: string;
  readonly release?: string;
  /** Removes the message of every reported error that is not a `DomainError`: for a tracker hosted by a third party. */
  readonly scrubMessages: boolean;
}

/** The realm tokens come from, and the audience this service answers to; the client id adds its client roles to the realm roles. */
interface KeycloakConfig {
  readonly baseUrl: string;
  readonly realm: string;
  readonly audience: string;
  readonly clientId?: string;
}
