import { InMemoryRepository, snapshots } from '@ddd-ts-kit/testing';
import { LegalMaximumRate } from '@/contexts/credit-policy/domain/aggregates/legal-maximum-rate.aggregate';
import type { LegalMaximumRateRepository } from '@/contexts/credit-policy/domain/repositories/legal-maximum-rate.repository';

export class FakeLegalMaximumRateRepository
  extends InMemoryRepository<LegalMaximumRate>
  implements LegalMaximumRateRepository
{
  constructor() {
    super(
      snapshots({
        toSnapshot: (stored: LegalMaximumRate) => ({ id: stored.id, state: stored.toState() }),
        fromSnapshot: ({ id, state }) => LegalMaximumRate.rehydrate(id, state),
      }),
    );
  }

  async findLatestOf(category: string): Promise<LegalMaximumRate | undefined> {
    const ofCategory = this.all().filter((rate) => rate.category === category);

    return ofCategory.sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime())[0];
  }
}
