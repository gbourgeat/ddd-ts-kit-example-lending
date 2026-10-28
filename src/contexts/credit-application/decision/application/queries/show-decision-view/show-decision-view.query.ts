import { AuthorizedQuery, type Actor } from '@ddd-ts-kit/kernel';
import type { ShowDecisionViewResult } from '@/contexts/credit-application/decision/application/queries/show-decision-view/show-decision-view.result';

/** What the decider saw when they decided one application, read back from the file as it was recorded. */
export class ShowDecisionViewQuery extends AuthorizedQuery<ShowDecisionViewResult> {
  constructor(
    actor: Actor,
    readonly applicationId: string,
  ) {
    super(actor);
  }
}
