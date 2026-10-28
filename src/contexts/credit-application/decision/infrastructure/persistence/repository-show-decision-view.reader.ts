import type { ShowDecisionViewReader } from '@/contexts/credit-application/decision/application/ports/show-decision-view-reader.port';
import { decisionViewOf } from '@/contexts/credit-application/decision/application/projections/decision-view-of.projection';
import type { ShowDecisionViewQuery } from '@/contexts/credit-application/decision/application/queries/show-decision-view/show-decision-view.query';
import type { ShowDecisionViewResult } from '@/contexts/credit-application/decision/application/queries/show-decision-view/show-decision-view.result';
import { UnknownCreditApplication } from '@/contexts/credit-application/file/domain/errors/unknown-credit-application.error';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';

/** Reads the decision view from the file's history in the store: what was recorded, never the current data. */
export class RepositoryShowDecisionViewReader implements ShowDecisionViewReader {
  constructor(private readonly repository: CreditApplicationRepository) {}

  async read(query: ShowDecisionViewQuery): Promise<ShowDecisionViewResult | undefined> {
    const history = await this.repository.historyOf(query.applicationId);

    if (history.length === 0) {
      throw UnknownCreditApplication.forCreditApplication(query.applicationId);
    }

    return decisionViewOf(query.applicationId, history);
  }
}
