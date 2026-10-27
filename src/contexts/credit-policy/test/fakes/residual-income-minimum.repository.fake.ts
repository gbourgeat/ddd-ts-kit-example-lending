import { InMemoryRepository, snapshots } from '@ddd-ts-kit/testing';
import { ResidualIncomeMinimum } from '@/contexts/credit-policy/domain/aggregates/residual-income-minimum.aggregate';
import type { ResidualIncomeMinimumRepository } from '@/contexts/credit-policy/domain/repositories/residual-income-minimum.repository';

export class FakeResidualIncomeMinimumRepository
  extends InMemoryRepository<ResidualIncomeMinimum>
  implements ResidualIncomeMinimumRepository
{
  constructor() {
    super(
      snapshots({
        toSnapshot: (stored: ResidualIncomeMinimum) => ({ id: stored.id, state: stored.toState() }),
        fromSnapshot: ({ id, state }) => ResidualIncomeMinimum.rehydrate(id, state),
      }),
    );
  }
}
