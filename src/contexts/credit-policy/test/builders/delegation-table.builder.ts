import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { DelegationTable } from '@/contexts/credit-policy/domain/aggregates/delegation-table.aggregate';

interface DelegationTableIngredients {
  readonly id: string;
  readonly bornAt: Date;
  readonly effectiveFrom: Date;
}

export class DelegationTableBuilder extends Builder<DelegationTableIngredients, DelegationTable> {
  identifiedBy(id: string): this {
    return this.with('id', id);
  }

  bornAt(instant: Date): this {
    return this.with('bornAt', instant);
  }

  takingEffectOn(effectiveFrom: Date): this {
    return this.with('effectiveFrom', effectiveFrom);
  }

  protected defaults(): Defaults<DelegationTableIngredients> {
    return {
      id: sequence('delegation-table'),
      bornAt: new Date('2026-01-01T00:00:00.000Z'),
      effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
    };
  }

  protected construct(ingredients: DelegationTableIngredients): DelegationTable {
    return DelegationTable.create(ingredients.id, ingredients.effectiveFrom, ingredients.bornAt);
  }
}

export function aDelegationTable(): DelegationTableBuilder {
  return new DelegationTableBuilder();
}
