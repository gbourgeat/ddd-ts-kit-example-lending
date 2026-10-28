import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { Money } from '@/shared-kernel/money.vo';
import { DecisionOutcome } from '@/contexts/credit-application/decision/domain/vocabularies/decision-outcome.vocabulary';
import {
  CreditApplication,
  type CreditApplicationEvent,
} from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { CreditApplicationAssessed } from '@/contexts/credit-application/file/domain/events/credit-application-assessed.event';
import { CreditApplicationDecided } from '@/contexts/credit-application/file/domain/events/credit-application-decided.event';
import { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';

interface CreditApplicationIngredients {
  readonly id: string;
  readonly applicantId: string;
  readonly amount: Money;
  readonly durationMonths: number;
  readonly bornAt: Date;
  readonly branchId: string;
  readonly productId: string;
  /** The amount a decision approved, in cents: undefined while the application is not decided. */
  readonly approvedCents: number | undefined;
}

/** Builds CreditApplication the way a load does: by replaying a history of events. */
export class CreditApplicationBuilder extends Builder<CreditApplicationIngredients, CreditApplication> {
  identifiedBy(id: string): this {
    return this.with('id', id);
  }

  submittedBy(applicantId: string): this {
    return this.with('applicantId', applicantId);
  }

  requesting(cents: number): this {
    return this.with('amount', Money.ofCents(cents));
  }

  forMonths(durationMonths: number): this {
    return this.with('durationMonths', durationMonths);
  }

  bornAt(instant: Date): this {
    return this.with('bornAt', instant);
  }

  onBranch(branchId: string): this {
    return this.with('branchId', branchId);
  }

  forProduct(productId: string): this {
    return this.with('productId', productId);
  }

  /** Assessed, then approved by a decider for `cents`: the history a load replays. */
  approvedFor(cents: number): this {
    return this.with('approvedCents', cents);
  }

  protected defaults(): Defaults<CreditApplicationIngredients> {
    return {
      id: sequence('credit-application'),
      applicantId: 'customer-1',
      amount: Money.ofCents(1234567),
      durationMonths: 60,
      bornAt: new Date('2026-01-01T00:00:00.000Z'),
      branchId: 'branch-1',
      productId: '',
      approvedCents: undefined,
    };
  }

  protected construct(ingredients: CreditApplicationIngredients): CreditApplication {
    return CreditApplication.rehydrate(ingredients.id, {
      events: [
        new CreditApplicationSubmitted(
          ingredients.id,
          ingredients.applicantId,
          ingredients.amount,
          ingredients.durationMonths,
          ingredients.bornAt,
          ingredients.branchId,
          ingredients.productId,
        ),
        ...this.decisionEvents(ingredients),
      ],
    });
  }

  private decisionEvents(ingredients: CreditApplicationIngredients): CreditApplicationEvent[] {
    if (ingredients.approvedCents === undefined) {
      return [];
    }

    const at = ingredients.bornAt;

    const assessment = {
      modelVersion: '2026.1',
      debtToIncomePercent: 20,
      repaymentIncidents: 0,
      residualIncomeCents: 160_000,
      score: 85,
      band: 'green',
      factors: [],
      proposedOutcome: DecisionOutcome.Approve,
    };

    return [
      new CreditApplicationAssessed(ingredients.id, at, assessment, 'assessor-1'),
      new CreditApplicationDecided(
        ingredients.id,
        at,
        DecisionOutcome.Approve,
        'decider-1',
        'advisor',
        '',
        '',
        ingredients.approvedCents,
        ingredients.branchId,
        false,
      ),
    ];
  }
}

export function aCreditApplication(): CreditApplicationBuilder {
  return new CreditApplicationBuilder();
}
