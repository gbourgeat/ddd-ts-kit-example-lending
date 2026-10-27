import { tenantScopeOf, type ExecutionScope } from '@ddd-ts-kit/kernel';
import type { ApplicationListProjection } from '@/contexts/credit-application/file/application/ports/application-list-projection.port';
import type { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';
import type { Database } from '@/platform/database/database';

/** The application list read model in its table: the row is written in the tenant of the submission, once. */
export class PrismaApplicationListProjection implements ApplicationListProjection {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
  ) {}

  async recordSubmitted(event: CreditApplicationSubmitted): Promise<void> {
    await this.database.client().creditApplicationListedApplication.createMany({
      data: [
        {
          id: event.aggregateId,
          applicantId: event.applicantId,
          requestedAmountCents: event.amount.cents,
          durationMonths: event.durationMonths,
          submittedAt: event.occurredAt,
          ...tenantScopeOf(this.scope),
        },
      ],
      skipDuplicates: true,
    });
  }
}
