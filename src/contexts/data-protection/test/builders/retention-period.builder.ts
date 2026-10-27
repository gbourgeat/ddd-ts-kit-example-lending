import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { RetentionPeriod } from '@/contexts/data-protection/domain/aggregates/retention-period.aggregate';

interface RetentionPeriodIngredients {
  readonly id: string;
  readonly bornAt: Date;
  readonly contextName: string;
  readonly kindOfData: string;
  readonly durationInMonths: number;
}

export class RetentionPeriodBuilder extends Builder<RetentionPeriodIngredients, RetentionPeriod> {
  identifiedBy(id: string): this {
    return this.with('id', id);
  }

  bornAt(instant: Date): this {
    return this.with('bornAt', instant);
  }

  ofContext(contextName: string): this {
    return this.with('contextName', contextName);
  }

  forKind(kindOfData: string): this {
    return this.with('kindOfData', kindOfData);
  }

  lastingMonths(durationInMonths: number): this {
    return this.with('durationInMonths', durationInMonths);
  }

  protected defaults(): Defaults<RetentionPeriodIngredients> {
    return {
      id: sequence('retention-period'),
      bornAt: new Date('2026-01-01T00:00:00.000Z'),
      contextName: 'credit-application',
      kindOfData: 'refused application',
      durationInMonths: 6,
    };
  }

  protected construct(ingredients: RetentionPeriodIngredients): RetentionPeriod {
    return RetentionPeriod.create(
      ingredients.id,
      {
        contextName: ingredients.contextName,
        kindOfData: ingredients.kindOfData,
        durationInMonths: ingredients.durationInMonths,
      },
      ingredients.bornAt,
    );
  }
}

export function aRetentionPeriod(): RetentionPeriodBuilder {
  return new RetentionPeriodBuilder();
}
