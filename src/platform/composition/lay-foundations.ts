import {
  AsyncLocalStorageExecutionScope,
  InMemoryCache,
  InMemoryLock,
  InMemoryRateLimiter,
  NoopErrorReporter,
  SystemClock,
  UuidGenerator,
  type JobScheduler,
} from '@ddd-ts-kit/kernel';
import { InProcessJobScheduler, reportFailedRuns, type InProcessJobSchedulerOptions } from '@ddd-ts-kit/scheduling';
import { traceApplication, type TracedApplication } from '@ddd-ts-kit/tracing';
import { createAudit } from '@/platform/audit/create-audit';
import type { Platform } from '@/platform/composition/platform';
import type { PlatformOptions } from '@/platform/composition/platform-options';
import type { Persistence } from '@/platform/database/persistence';
import { tenantDirectory } from '@/platform/composition/tenant-directory';
import { createEventSourcing } from '@/platform/event-sourcing/create-event-sourcing';
import { ConfiguredJobScheduler } from '@/platform/jobs/configured-job-scheduler';
import { createLogger } from '@/platform/observability/create-logger';
import { createMetrics } from '@/platform/observability/create-metrics';

type Founded =
  | 'scope'
  | 'clock'
  | 'ids'
  | 'logger'
  | 'metrics'
  | 'errors'
  | 'cache'
  | 'jobs'
  | 'rateLimiter'
  | 'audit'
  | 'eventSourcing';

/**
 * What exists before anything else: one execution scope, one clock and one generator for the
 * buses, the logger and every adapter, the audit sources, and what observes the application from outside.
 */
export interface Foundations extends Pick<Platform, Founded> {
  /** One span per use case, adapter call, domain event, publication, consumer and job: handed to the buses and to every adapter. */
  readonly traced: TracedApplication;
}

export function layFoundations(persistence: Persistence, options: PlatformOptions): Foundations {
  const traced = traceApplication({ consumers: options.traceConsumers ?? 'continue' });
  const scope = new AsyncLocalStorageExecutionScope();

  // Spans and log fields carry the correlation id of the work in progress.
  traced.executionScope(scope);

  const clock = new SystemClock();
  const ids = new UuidGenerator();
  const logger = createLogger(scope, options.log);
  const metrics = createMetrics();
  // Reports carry the id of the trace they happened in.
  const errors = traced.errorReporter(options.errors ?? new NoopErrorReporter());
  const lock = options.redis?.lock ?? new InMemoryLock(clock);
  const audit = createAudit(persistence, { scope, clock, ids });

  // The tenants a job declared `per-tenant` runs for, asked at each occurrence.
  const parts = { clock, lock, scope, ids, logger, metrics, tenants: tenantDirectory(persistence, options.tenants) };

  return {
    traced,
    scope,
    clock,
    ids,
    logger,
    metrics,
    errors,
    cache: options.redis?.cache(metrics) ?? new InMemoryCache(clock),
    rateLimiter: options.redis?.rateLimiter ?? new InMemoryRateLimiter(clock),
    // A run that failed, a timeout included, is reported; a skipped or missed occurrence is not.
    jobs: schedulerOf(options, traced, { ...parts, onRun: reportFailedRuns(errors) }),
    audit,
    eventSourcing: createEventSourcing(persistence, audit, { scope, clock, ids }),
  };
}

/** The scheduler of the process, with the settings of the configuration applied and each run observed from outside. */
function schedulerOf(
  options: PlatformOptions,
  traced: TracedApplication,
  parts: InProcessJobSchedulerOptions,
): JobScheduler {
  return new ConfiguredJobScheduler(new InProcessJobScheduler(parts), options.jobs?.settings ?? {}, traced.job);
}
