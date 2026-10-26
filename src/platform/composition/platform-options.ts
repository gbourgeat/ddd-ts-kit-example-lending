import type { ErrorReporter, FileStorage, JobSettings } from '@ddd-ts-kit/kernel';
import type { QueueWorkerOptions } from '@ddd-ts-kit/scheduling';
import type { ConsumerTrace } from '@ddd-ts-kit/tracing';
import type { EventProvider } from '@/platform/events/event-provider';
import type { LogSettings } from '@/platform/observability/create-logger';
import type { RedisServices } from '@/platform/redis/open-redis';
import type { ResilienceSettings } from '@/platform/resilience/resilience-settings';

interface JobsOptions {
  readonly start?: boolean;
  /** What configuration changes of a job, by job name: what `job-settings.ts` answers. */
  readonly settings?: Readonly<Record<string, JobSettings>>;
}

/** What the platform is built on, beyond the storage: chosen in `main.ts`, defaulted for the tools and the tests. */
export interface PlatformOptions {
  /** The provider integration events are delivered to: the broker in `main.ts`, the process itself for the tools and most tests. */
  readonly events: EventProvider;
  /** Where log entries go; left out, the application writes nothing. */
  readonly log?: LogSettings;
  /** Where unexpected failures are reported: the reporter of `errors.ts` in `main.ts`; left out (the tools, the tests), nowhere. */
  readonly errors?: ErrorReporter;
  /** The policy around every adapter that leaves the process; left out, `resilience/default-resilience-settings.ts`. */
  readonly resilience?: ResilienceSettings;
  /** Whether this process runs the scheduled jobs and consumes the background jobs, and the settings of the scheduled ones; left out (the tools, the tests), no job runs by time. */
  readonly jobs?: JobsOptions;
  /**
   * Whether this composition registers the jobs of the platform itself. They belong to one process of a deployment, the
   * whole application: a service passes `false`, or each of its containers would run them on the same database. Default: `true`.
   */
  readonly platformJobs?: boolean;
  /** The ids of the tenants that exist (`TENANTS`): a job declared `per-tenant` runs once for each. Left out (the tools, the tests), none, and such a job runs for nobody. */
  readonly tenants?: readonly string[];
  /** Concurrency per queue, polling interval and grace period of the worker of the background jobs; left out, one attempt at a time per queue. */
  readonly queues?: Pick<QueueWorkerOptions, 'concurrency' | 'pollIntervalMs' | 'graceMs'>;
  /** Whether a consumed event continues the trace of its publication (the default) or starts one linked to it. */
  readonly traceConsumers?: ConsumerTrace;
  /** The Redis protocol server; left out, the cache, the lock and the limiter stay in the memory of the process. */
  readonly redis?: RedisServices;
  /** Where the content of files lives: the storage of `main.ts`; left out (the tools, the tests), the memory of the process. */
  readonly files?: FileStorage;
}
