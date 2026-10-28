import { AuthorizedQuery, type Actor } from '@ddd-ts-kit/kernel';
import type { ReadRateGridResult } from '@/contexts/credit-application/offer/application/queries/read-rate-grid/read-rate-grid.result';

/** The rate grid of one id, read by a decider before deciding an application. */
export class ReadRateGridQuery extends AuthorizedQuery<ReadRateGridResult> {
  constructor(
    actor: Actor,
    readonly rateGridId: string,
  ) {
    super(actor);
  }
}
