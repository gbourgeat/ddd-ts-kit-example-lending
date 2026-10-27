import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { SuspiciousActivityReport } from '@/contexts/financial-crime/domain/aggregates/suspicious-activity-report.aggregate';

interface SuspiciousActivityReportIngredients {
  readonly id: string;
  readonly bornAt: Date;
  readonly subjectReference: string;
  readonly filingReference: string | undefined;
}

export class SuspiciousActivityReportBuilder extends Builder<
  SuspiciousActivityReportIngredients,
  SuspiciousActivityReport
> {
  identifiedBy(id: string): this {
    return this.with('id', id);
  }

  bornAt(instant: Date): this {
    return this.with('bornAt', instant);
  }

  about(subjectReference: string): this {
    return this.with('subjectReference', subjectReference);
  }

  /** The report the financial intelligence unit has received under this reference; pending when not given. */
  filedAs(filingReference: string): this {
    return this.with('filingReference', filingReference);
  }

  protected defaults(): Defaults<SuspiciousActivityReportIngredients> {
    return {
      id: sequence('suspicious-activity-report'),
      bornAt: new Date('2026-01-01T00:00:00.000Z'),
      subjectReference: 'loan-1',
      filingReference: undefined,
    };
  }

  protected construct(ingredients: SuspiciousActivityReportIngredients): SuspiciousActivityReport {
    const report = SuspiciousActivityReport.create(ingredients.id, ingredients.subjectReference, ingredients.bornAt);

    if (ingredients.filingReference !== undefined) {
      report.file(ingredients.filingReference, ingredients.bornAt);
    }

    return report;
  }
}

export function aSuspiciousActivityReport(): SuspiciousActivityReportBuilder {
  return new SuspiciousActivityReportBuilder();
}
