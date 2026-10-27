import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { DelegationTable } from '@/contexts/credit-policy/domain/aggregates/delegation-table.aggregate';
import { DelegationLimit } from '@/contexts/credit-policy/domain/value-objects/delegation-limit.vo';
import { DelegationTableTerms } from '@/contexts/credit-policy/domain/value-objects/delegation-table-terms.vo';
import { DelegationLevel } from '@/contexts/credit-policy/domain/vocabularies/delegation-level.vocabulary';

export interface DelegationLimitInput {
  readonly level: DelegationLevel;
  readonly amountCents: number;
}

interface DelegationTableIngredients {
  readonly id: string;
  readonly bornAt: Date;
  readonly effectiveFrom: Date;
  readonly limits: readonly DelegationLimitInput[];
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

  withLimits(limits: readonly DelegationLimitInput[]): this {
    return this.with('limits', limits);
  }

  protected defaults(): Defaults<DelegationTableIngredients> {
    return {
      id: sequence('delegation-table'),
      bornAt: new Date('2026-01-01T00:00:00.000Z'),
      effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
      limits: [
        { level: DelegationLevel.Advisor, amountCents: 1_500_000 },
        { level: DelegationLevel.CreditAnalyst, amountCents: 7_500_000 },
        { level: DelegationLevel.RiskManager, amountCents: 25_000_000 },
        { level: DelegationLevel.CreditCommittee, amountCents: 100_000_000 },
      ],
    };
  }

  protected construct(ingredients: DelegationTableIngredients): DelegationTable {
    const terms = DelegationTableTerms.create({
      effectiveFrom: ingredients.effectiveFrom,
      limits: ingredients.limits.map((limit) => DelegationLimit.create(limit)),
    });

    return DelegationTable.create(ingredients.id, terms, ingredients.bornAt);
  }
}

export function aDelegationTable(): DelegationTableBuilder {
  return new DelegationTableBuilder();
}
