import { loggingMiddleware, metricsMiddleware } from '@ddd-ts-kit/aspects';
import { InMemoryQueryBus, errorReportingMiddleware, type BusMiddleware } from '@ddd-ts-kit/kernel';
import type { Foundations } from '@/platform/composition/lay-foundations';

/** Around every query, outermost first: the report of an unexpected failure, its log entry, its measure, the permission (`guard`), its span, the audit entry of the reads that leave one. */
export function createQueryBus(foundations: Foundations, guard: BusMiddleware): InMemoryQueryBus {
  return new InMemoryQueryBus()
    .use(errorReportingMiddleware(foundations.errors, foundations.scope))
    .use(loggingMiddleware(foundations.logger))
    .use(metricsMiddleware(foundations.metrics))
    .use(guard)
    .use(foundations.traced.useCase)
    .use(foundations.audit.queries);
}
