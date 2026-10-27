import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { Loan } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';

interface LoanIngredients {
  readonly id: string;
  readonly bornAt: Date;
}

export class LoanBuilder extends Builder<LoanIngredients, Loan> {
  identifiedBy(id: string): this {
    return this.with('id', id);
  }

  bornAt(instant: Date): this {
    return this.with('bornAt', instant);
  }

  protected defaults(): Defaults<LoanIngredients> {
    return { id: sequence('loan'), bornAt: new Date('2026-01-01T00:00:00.000Z') };
  }

  protected construct(ingredients: LoanIngredients): Loan {
    return Loan.create(ingredients.id, ingredients.bornAt);
  }
}

export function aLoan(): LoanBuilder {
  return new LoanBuilder();
}
