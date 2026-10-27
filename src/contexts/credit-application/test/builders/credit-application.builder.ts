import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { Money } from '@/shared-kernel/money.vo';
import { CreditApplication } from '@/contexts/credit-application/file/domain/aggregates/credit-application.aggregate';
import { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';

interface CreditApplicationIngredients {
  readonly id: string;
  readonly applicantId: string;
  readonly amount: Money;
  readonly durationMonths: number;
  readonly bornAt: Date;
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

  protected defaults(): Defaults<CreditApplicationIngredients> {
    return {
      id: sequence('credit-application'),
      applicantId: 'customer-1',
      amount: Money.ofCents(1234567),
      durationMonths: 60,
      bornAt: new Date('2026-01-01T00:00:00.000Z'),
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
        ),
      ],
    });
  }
}

export function aCreditApplication(): CreditApplicationBuilder {
  return new CreditApplicationBuilder();
}
