import { Entity } from '@ddd-ts-kit/kernel';
import type { RiskLevel } from '@/contexts/credit-scoring/domain/vocabularies/risk-level.vocabulary';
import { ScoringModelLabelRequired } from '@/contexts/credit-scoring/domain/errors/scoring-model-label-required.error';

export interface ScoringModelVersionState {
  readonly number: number;
  readonly modelRisk: RiskLevel;
  readonly label: string;
  readonly publishedAt: Date;
}

export class ScoringModelVersion extends Entity<string> {
  private constructor(
    id: string,
    private state: ScoringModelVersionState,
  ) {
    super(id);
  }

  static create(id: string, state: ScoringModelVersionState): ScoringModelVersion {
    if (state.label.trim() === '') {
      throw ScoringModelLabelRequired.forLabel();
    }

    return new ScoringModelVersion(id, state);
  }

  static rehydrate(id: string, state: ScoringModelVersionState): ScoringModelVersion {
    return new ScoringModelVersion(id, state);
  }

  get number(): number {
    return this.state.number;
  }

  get modelRisk(): RiskLevel {
    return this.state.modelRisk;
  }

  get label(): string {
    return this.state.label;
  }

  toState(): ScoringModelVersionState {
    return { ...this.state };
  }
}
