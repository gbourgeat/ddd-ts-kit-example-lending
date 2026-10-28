import type { ShowDecisionViewReader } from '@/contexts/credit-application/decision/application/ports/show-decision-view-reader.port';
import type { ShowDecisionViewResult } from '@/contexts/credit-application/decision/application/queries/show-decision-view/show-decision-view.result';

/** A reader that answers the view it is given, or no view when it is given none: the file holds no decision. */
export class FakeShowDecisionViewReader implements ShowDecisionViewReader {
  constructor(private readonly answer: ShowDecisionViewResult | undefined) {}

  async read(): Promise<ShowDecisionViewResult | undefined> {
    return this.answer;
  }
}
