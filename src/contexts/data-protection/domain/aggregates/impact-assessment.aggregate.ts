import { AggregateRoot } from '@ddd-ts-kit/kernel';
import { InvalidScoringModelVersion } from '@/contexts/data-protection/domain/errors/invalid-scoring-model-version.error';
import { InvalidYearMonth } from '@/contexts/data-protection/domain/errors/invalid-year-month.error';

/** A month of a year, written YYYY-MM. */
const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

export interface ImpactAssessmentState {
  readonly registeredAt: Date;
  readonly scoringModelVersion: string;
  /** The month the assessment is for, written YYYY-MM. */
  readonly month: string;
}

export class ImpactAssessment extends AggregateRoot<string> {
  private constructor(
    id: string,
    private state: ImpactAssessmentState,
  ) {
    super(id);
  }

  /** The identifier names the pair of the scoring model version and the month: a second record of the pair is found under it. */
  static identifierOf(scoringModelVersion: string, month: string): string {
    return `${scoringModelVersion.trim()}:${month}`;
  }

  /** Records the assessment of a scoring model version for a month: a blank version and a month not written YYYY-MM are refused. */
  static create(id: string, scoringModelVersion: string, month: string, now: Date): ImpactAssessment {
    const version = scoringModelVersion.trim();

    if (version.length === 0) {
      throw InvalidScoringModelVersion.forVersion(scoringModelVersion);
    }

    if (!YEAR_MONTH.test(month)) {
      throw InvalidYearMonth.forText(month);
    }

    return new ImpactAssessment(id, { registeredAt: now, scoringModelVersion: version, month });
  }

  static rehydrate(id: string, state: ImpactAssessmentState): ImpactAssessment {
    return new ImpactAssessment(id, state);
  }

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  get scoringModelVersion(): string {
    return this.state.scoringModelVersion;
  }

  get month(): string {
    return this.state.month;
  }

  toState(): ImpactAssessmentState {
    return { ...this.state };
  }
}
