import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { ImpactAssessment } from '@/contexts/data-protection/domain/aggregates/impact-assessment.aggregate';

interface ImpactAssessmentIngredients {
  readonly id: string;
  readonly bornAt: Date;
  readonly scoringModelVersion: string;
  readonly month: string;
}

export class ImpactAssessmentBuilder extends Builder<ImpactAssessmentIngredients, ImpactAssessment> {
  identifiedBy(id: string): this {
    return this.with('id', id);
  }

  bornAt(instant: Date): this {
    return this.with('bornAt', instant);
  }

  /** The scoring model version the assessment is about. */
  forVersion(scoringModelVersion: string): this {
    return this.with('scoringModelVersion', scoringModelVersion);
  }

  /** The month the assessment is for, written YYYY-MM. */
  forMonth(month: string): this {
    return this.with('month', month);
  }

  protected defaults(): Defaults<ImpactAssessmentIngredients> {
    return {
      id: sequence('impact-assessment'),
      bornAt: new Date('2026-01-01T00:00:00.000Z'),
      scoringModelVersion: '2026.1',
      month: '2026-01',
    };
  }

  protected construct(ingredients: ImpactAssessmentIngredients): ImpactAssessment {
    return ImpactAssessment.create(
      ingredients.id,
      ingredients.scoringModelVersion,
      ingredients.month,
      ingredients.bornAt,
    );
  }
}

export function anImpactAssessment(): ImpactAssessmentBuilder {
  return new ImpactAssessmentBuilder();
}
