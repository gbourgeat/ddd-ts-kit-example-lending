import type { QueryHandler } from '@ddd-ts-kit/kernel';
import type { ShowDecisionViewReader } from '@/contexts/credit-application/decision/application/ports/show-decision-view-reader.port';
import type { ShowDecisionViewQuery } from '@/contexts/credit-application/decision/application/queries/show-decision-view/show-decision-view.query';
import type { ShowDecisionViewResult } from '@/contexts/credit-application/decision/application/queries/show-decision-view/show-decision-view.result';
import { NotDecided } from '@/contexts/credit-application/decision/domain/errors/not-decided.error';

/**
 * Answers what the decider saw. The read is not narrowed by an element: the permission is held on the context, as the
 * decision itself is, so the reader gives the file as it was recorded, and a file with no decision has nothing to show.
 */
export class ShowDecisionViewHandler implements QueryHandler<ShowDecisionViewQuery> {
  constructor(private readonly reader: ShowDecisionViewReader) {}

  async execute(query: ShowDecisionViewQuery): Promise<ShowDecisionViewResult> {
    const view = await this.reader.read(query);

    if (view === undefined) {
      throw NotDecided.forNotDecided();
    }

    return view;
  }
}
