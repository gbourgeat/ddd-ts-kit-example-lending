import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { ConflictOfInterest } from '@/contexts/branch-network/domain/aggregates/conflict-of-interest.aggregate';

interface ConflictOfInterestIngredients {
  readonly id: string;
  readonly bornAt: Date;
  readonly staffMemberId: string;
  readonly customerId: string;
}

export class ConflictOfInterestBuilder extends Builder<ConflictOfInterestIngredients, ConflictOfInterest> {
  identifiedBy(id: string): this {
    return this.with('id', id);
  }

  bornAt(instant: Date): this {
    return this.with('bornAt', instant);
  }

  declaredBy(staffMemberId: string): this {
    return this.with('staffMemberId', staffMemberId);
  }

  about(customerId: string): this {
    return this.with('customerId', customerId);
  }

  protected defaults(): Defaults<ConflictOfInterestIngredients> {
    return {
      id: sequence('conflict-of-interest'),
      bornAt: new Date('2026-01-01T00:00:00.000Z'),
      staffMemberId: 'staff-member-1',
      customerId: 'customer-1',
    };
  }

  protected construct(ingredients: ConflictOfInterestIngredients): ConflictOfInterest {
    return ConflictOfInterest.create(
      ingredients.id,
      ingredients.staffMemberId,
      ingredients.customerId,
      ingredients.bornAt,
    );
  }
}

export function aConflictOfInterest(): ConflictOfInterestBuilder {
  return new ConflictOfInterestBuilder();
}
