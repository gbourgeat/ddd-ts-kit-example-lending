import type { ShowDecisionViewQuery } from '@/contexts/credit-application/decision/application/queries/show-decision-view/show-decision-view.query';
import type { ShowDecisionViewResult } from '@/contexts/credit-application/decision/application/queries/show-decision-view/show-decision-view.result';

/** Reads what the decider saw of an application from its file. Answers undefined when the file holds no decision. */
export abstract class ShowDecisionViewReader {
  abstract read(query: ShowDecisionViewQuery): Promise<ShowDecisionViewResult | undefined>;
}
