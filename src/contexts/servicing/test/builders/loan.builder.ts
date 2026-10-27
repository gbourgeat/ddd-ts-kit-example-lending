import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { Loan } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';
import { LoanPaidOut } from '@/contexts/servicing/ledger/domain/events/loan-paid-out.event';

interface LoanIngredients {
  readonly id: string;
  readonly bornAt: Date;
  // TODO(domain): add one ingredient per fact a test may need to choose, each with a valid default below.
}

/** Builds Loan the way a load does: by replaying a history of events. */
export class LoanBuilder extends Builder<LoanIngredients, Loan> {
  identifiedBy(id: string): this {
    return this.with('id', id);
  }

  bornAt(instant: Date): this {
    return this.with('bornAt', instant);
  }

  // TODO(domain): add one method per state a test needs, named in the ubiquitous language, and add the events that reach it to the history replayed in `construct`.

  protected defaults(): Defaults<LoanIngredients> {
    return { id: sequence('loan'), bornAt: new Date('2026-01-01T00:00:00.000Z') };
  }

  protected construct(ingredients: LoanIngredients): Loan {
    return Loan.rehydrate(ingredients.id, {
      events: [new LoanPaidOut(ingredients.id, ingredients.bornAt)],
    });
  }
}

export function aLoan(): LoanBuilder {
  return new LoanBuilder();
}
