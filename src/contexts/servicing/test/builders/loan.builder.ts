import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { Loan } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';
import { Borrower } from '@/contexts/servicing/ledger/domain/value-objects/borrower.vo';
import { LoanSchedule } from '@/contexts/servicing/ledger/domain/value-objects/loan-schedule.vo';
import { Money } from '@/shared-kernel/money.vo';

const ONE_THOUSAND_EUROS_IN_CENTS = 100_000;
const ANNUAL_RATE_BASIS_POINTS = 500;
const DURATION_MONTHS = 12;

interface LoanIngredients {
  readonly id: string;
  readonly bornAt: Date;
  readonly borrower: Borrower;
}

export class LoanBuilder extends Builder<LoanIngredients, Loan> {
  identifiedBy(id: string): this {
    return this.with('id', id);
  }

  bornAt(instant: Date): this {
    return this.with('bornAt', instant);
  }

  borrowedBy(borrower: Borrower): this {
    return this.with('borrower', borrower);
  }

  protected defaults(): Defaults<LoanIngredients> {
    return {
      id: sequence('loan'),
      bornAt: new Date('2026-01-01T00:00:00.000Z'),
      borrower: Borrower.create('Ada Lovelace', '1 rue de la Paix, 75002 Paris'),
    };
  }

  protected construct(ingredients: LoanIngredients): Loan {
    return Loan.create(ingredients.id, {
      paidOutAt: ingredients.bornAt,
      borrower: ingredients.borrower,
      schedule: LoanSchedule.of(Money.ofCents(ONE_THOUSAND_EUROS_IN_CENTS), ANNUAL_RATE_BASIS_POINTS, DURATION_MONTHS),
    });
  }
}

export function aLoan(): LoanBuilder {
  return new LoanBuilder();
}
