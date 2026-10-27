import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { Branch } from '@/contexts/branch-network/domain/aggregates/branch.aggregate';

interface BranchIngredients {
  readonly id: string;
  readonly bornAt: Date;
}

export class BranchBuilder extends Builder<BranchIngredients, Branch> {
  identifiedBy(id: string): this {
    return this.with('id', id);
  }

  bornAt(instant: Date): this {
    return this.with('bornAt', instant);
  }

  protected defaults(): Defaults<BranchIngredients> {
    return { id: sequence('branch'), bornAt: new Date('2026-01-01T00:00:00.000Z') };
  }

  protected construct(ingredients: BranchIngredients): Branch {
    return Branch.create(ingredients.id, ingredients.bornAt);
  }
}

export function aBranch(): BranchBuilder {
  return new BranchBuilder();
}
