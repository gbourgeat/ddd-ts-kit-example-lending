import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';
import type { RefusalConclusion } from '@/contexts/credit-application/file/domain/values/refusal-conclusion';

/** The review a person gives of a proposed refusal: the conclusion, and the written reason of it. */
export interface RefusalReviewInput {
  readonly conclusion: RefusalConclusion;
  readonly reason: string;
}

/** A person reviews the refusal the last assessment of an application proposed: the reviewer is the actor. */
export class ReviewProposedRefusalCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly applicationId: string,
    readonly review: RefusalReviewInput,
  ) {
    super(actor);
  }
}
