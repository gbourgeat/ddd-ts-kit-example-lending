import { AuthorizedQuery, type Actor } from '@ddd-ts-kit/kernel';
import type { ReadProductTermsResult } from '@/contexts/credit-application/file/application/queries/read-product-terms/read-product-terms.result';

/** The terms of one product, read by a decider before deciding an application. */
export class ReadProductTermsQuery extends AuthorizedQuery<ReadProductTermsResult> {
  constructor(
    actor: Actor,
    readonly productId: string,
  ) {
    super(actor);
  }
}
