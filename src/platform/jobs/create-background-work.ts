import type { CommandBus, JobQueue, ProcessRunner } from '@ddd-ts-kit/kernel';
import {
  InMemoryJobStore,
  QueueWorker,
  StoredJobQueue,
  StoredProcessRunner,
  reportFailedBackgroundJobs,
  type JobStore,
} from '@ddd-ts-kit/scheduling';
import type { TracedApplication } from '@ddd-ts-kit/tracing';
import type { Foundations } from '@/platform/composition/lay-foundations';
import type { PlatformOptions } from '@/platform/composition/platform-options';
import type { Persistence } from '@/platform/database/persistence';
import type { BackgroundJobs } from '@/platform/jobs/background-jobs';

/** The queue a use case enqueues through, the worker that consumes it and the runner of the process managers. */
export interface BackgroundWork {
  /** What a use case enqueues through, in the transaction of its command when the store shares it. */
  readonly jobQueue: JobQueue;
  readonly backgroundJobs: BackgroundJobs;
  /** Runs the steps of the process managers and delivers their timeouts. */
  readonly processes: ProcessRunner;
}

interface BackgroundWorkParts {
  readonly persistence: Persistence;
  readonly options: PlatformOptions;
  readonly foundations: Foundations;
  /** The bus the runner of the process managers sends the commands of a step on. */
  readonly commands: CommandBus;
}

/**
 * The background work of the platform on one job store: the server of the cache, written
 * once the command committed; left out (the tools, the tests), the memory of the process. A job carries the correlation, the actor, the tenant and the trace of the
 * work that enqueued it; the worker runs each attempt in that scope.
 */
export function createBackgroundWork({
  persistence,
  options,
  foundations,
  commands,
}: BackgroundWorkParts): BackgroundWork {
  const { traced, clock, ids, scope } = foundations;
  const store = options.redis?.jobs(foundations.logger, foundations.errors) ?? new InMemoryJobStore();
  const jobQueue = new StoredJobQueue({ store, clock, ids, scope, traceparent: traced.traceparent });

  return {
    jobQueue,
    backgroundJobs: backgroundJobsOn(workerOn(store, options, foundations), traced),
    processes: new StoredProcessRunner({
      // The instances of the process managers, saved in the transaction of each step.
      store: persistence.processes(scope),
      jobs: jobQueue,
      commands,
      unitOfWork: persistence.unitOfWork,
    }),
  };
}

/** The worker of the store, tuned by `queues`; an attempt that failed, retried or not, is reported with the id of the trace it ran in. */
function workerOn(store: JobStore, options: PlatformOptions, foundations: Foundations): QueueWorker {
  const { clock, scope, logger, metrics } = foundations;

  return new QueueWorker({
    ...options.queues,
    store,
    clock,
    scope,
    logger,
    metrics,
    onRun: reportFailedBackgroundJobs(foundations.errors),
  });
}

/** Each attempt observed from outside (its span), named after the job and its context. */
function backgroundJobsOn(worker: QueueWorker, traced: TracedApplication): BackgroundJobs {
  return {
    register: (job, deps, options) => {
      const { jobName: name } = job;
      const built = new job(...deps);

      worker.register({
        name,
        ...(options === undefined ? {} : { options }),
        run: traced.backgroundJob((payload, execution) => built.run(payload, execution), {
          name,
          context: contextOf(name),
        }),
      });
    },
    start: () => worker.start(),
    stop: () => worker.stop(),
  };
}

/** A background job is named `<context>.<job>`. */
function contextOf(jobName: string): string {
  return jobName.split('.')[0] ?? jobName;
}
