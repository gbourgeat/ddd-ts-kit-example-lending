import { loggingMiddleware, metricsMiddleware } from '@ddd-ts-kit/aspects';
import {
  InMemoryCommandBus,
  errorReportingMiddleware,
  fileUploadsMiddleware,
  unitOfWorkMiddleware,
  type BusMiddleware,
} from '@ddd-ts-kit/kernel';
import { relayWakeUpMiddleware } from '@ddd-ts-kit/redis';
import type { Foundations } from '@/platform/composition/lay-foundations';
import type { Persistence } from '@/platform/database/persistence';
import type { Files } from '@/platform/files/create-files';
import type { RedisServices } from '@/platform/redis/open-redis';

/** What the command bus puts around a handler, beyond what the foundations give. */
interface AroundCommands {
  /** The guard of the use cases: the permission, asked before any handler. */
  readonly guard: BusMiddleware;
  /** The storage whose unit of work a command runs in. */
  readonly persistence: Persistence;
  /** Where the file a command carries is staged, before its transaction. */
  readonly files: Files;
  /** Wakes the outbox relay as soon as a command committed; without a Redis protocol server (the tools, most tests) the relay only polls. */
  readonly redis: RedisServices | undefined;
}

/**
 * Around every command, outermost first: the report of an unexpected failure (a failed commit
 * included), the log entry and the measure of the use case, the
 * permission, the span of the use case (a refused command never started), the staging of the file it carries, the wake-up of the outbox relay, the audit entry, then the unit of work. The audit entry
 * opens the transaction itself, so that the entry of a success commits with the state change
 * and the entry of a failure survives the rollback.
 */
export function createCommandBus(foundations: Foundations, around: AroundCommands): InMemoryCommandBus {
  return new InMemoryCommandBus()
    .use(errorReportingMiddleware(foundations.errors, foundations.scope))
    .use(loggingMiddleware(foundations.logger))
    .use(metricsMiddleware(foundations.metrics))
    .use(around.guard)
    .use(foundations.traced.useCase)
    .use(fileUploadsMiddleware(() => around.files))
    .use(wakingTheRelay(around.redis))
    .use(foundations.audit.commands)
    .use(unitOfWorkMiddleware(around.persistence.unitOfWork));
}

/** Without a Redis protocol server (the tools, most tests) the relay only polls. */
function wakingTheRelay(redis: RedisServices | undefined): BusMiddleware {
  return redis === undefined ? (_message, next) => next() : relayWakeUpMiddleware(redis.relaySignal);
}
