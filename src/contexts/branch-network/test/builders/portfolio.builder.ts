import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { Portfolio } from '@/contexts/branch-network/domain/aggregates/portfolio.aggregate';

interface PortfolioIngredients {
  readonly id: string;
  readonly bornAt: Date;
  readonly advisorId: string;
  readonly branchId: string;
}

export class PortfolioBuilder extends Builder<PortfolioIngredients, Portfolio> {
  identifiedBy(id: string): this {
    return this.with('id', id);
  }

  bornAt(instant: Date): this {
    return this.with('bornAt', instant);
  }

  heldBy(advisorId: string): this {
    return this.with('advisorId', advisorId);
  }

  inBranch(branchId: string): this {
    return this.with('branchId', branchId);
  }

  protected defaults(): Defaults<PortfolioIngredients> {
    return {
      id: sequence('portfolio'),
      bornAt: new Date('2026-01-01T00:00:00.000Z'),
      advisorId: 'staff-member-1',
      branchId: 'branch-1',
    };
  }

  protected construct(ingredients: PortfolioIngredients): Portfolio {
    return Portfolio.create(ingredients.id, ingredients.advisorId, ingredients.branchId, ingredients.bornAt);
  }
}

export function aPortfolio(): PortfolioBuilder {
  return new PortfolioBuilder();
}
