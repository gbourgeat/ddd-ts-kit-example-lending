import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';
import type { RateBandState } from '@/contexts/credit-policy/domain/aggregates/rate-grid.aggregate';

export class PublishRateGridCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly productId: string,
    readonly effectiveFrom: Date,
    readonly rates: readonly RateBandState[] = [],
  ) {
    super(actor);
  }
}
