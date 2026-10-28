import { AuthorizedQuery, type Actor } from '@ddd-ts-kit/kernel';
import type { ExplainRefusalResult } from '@/contexts/credit-application/file/application/queries/explain-refusal/explain-refusal.result';

/** Whether the signed-in actor may read an application, and if not, why: asked by any signed-in actor, since the answer is what that actor is told. */
export class ExplainRefusalQuery extends AuthorizedQuery<ExplainRefusalResult> {
  constructor(
    actor: Actor,
    readonly applicationId: string,
  ) {
    super(actor);
  }
}
