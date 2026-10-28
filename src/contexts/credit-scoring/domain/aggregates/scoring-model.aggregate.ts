import { AggregateRoot } from '@ddd-ts-kit/kernel';
import { ScoringModelPublished } from '@/contexts/credit-scoring/domain/events/scoring-model-published.event';
import type { RiskLevel } from '@/contexts/credit-scoring/domain/vocabularies/risk-level.vocabulary';
import { ScoringModelVersion } from '@/contexts/credit-scoring/domain/entities/scoring-model-version.entity';

export interface ScoringModelState {
  readonly registeredAt: Date;
  readonly versions: readonly ScoringModelVersion[];
}

export class ScoringModel extends AggregateRoot<string> {
  /** The bank has one scoring model, kept under this identifier: its versions are numbered in turn. */
  static readonly BANK_ID = 'bank-scoring-model';

  private constructor(
    id: string,
    private state: ScoringModelState,
  ) {
    super(id);
  }

  static create(id: string, now: Date): ScoringModel {
    return new ScoringModel(id, { registeredAt: now, versions: [] });
  }

  static rehydrate(id: string, state: ScoringModelState): ScoringModel {
    return new ScoringModel(id, state);
  }

  /** Publishes the next version of the model: its number is the next integer of the model, from 1. */
  publish(versionId: string, modelRisk: RiskLevel, label: string, now: Date): ScoringModelVersion {
    const version = ScoringModelVersion.create(versionId, {
      number: this.state.versions.length + 1,
      modelRisk,
      label,
      publishedAt: now,
    });

    this.state = { ...this.state, versions: [...this.state.versions, version] };
    this.record(new ScoringModelPublished(this.id, now, versionId, version.number, modelRisk, label));

    return version;
  }

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  get versions(): readonly ScoringModelVersion[] {
    return [...this.state.versions];
  }

  toState(): ScoringModelState {
    return { ...this.state, versions: [...this.state.versions] };
  }
}
