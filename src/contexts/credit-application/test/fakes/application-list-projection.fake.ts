import type { ApplicationListProjection } from '@/contexts/credit-application/file/application/ports/application-list-projection.port';
import type { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';

/** Keeps the submissions it was given, so that a test reads what the read model received. */
export class FakeApplicationListProjection implements ApplicationListProjection {
  private readonly submissions: CreditApplicationSubmitted[] = [];

  async recordSubmitted(event: CreditApplicationSubmitted): Promise<void> {
    this.submissions.push(event);
  }

  recorded(): readonly CreditApplicationSubmitted[] {
    return [...this.submissions];
  }
}
