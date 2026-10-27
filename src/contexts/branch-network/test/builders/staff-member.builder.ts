import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { StaffMember } from '@/contexts/branch-network/domain/aggregates/staff-member.aggregate';

interface StaffMemberIngredients {
  readonly id: string;
  readonly bornAt: Date;
  readonly name: string;
  readonly email: string;
}

export class StaffMemberBuilder extends Builder<StaffMemberIngredients, StaffMember> {
  identifiedBy(id: string): this {
    return this.with('id', id);
  }

  bornAt(instant: Date): this {
    return this.with('bornAt', instant);
  }

  named(name: string): this {
    return this.with('name', name);
  }

  reachableAt(email: string): this {
    return this.with('email', email);
  }

  protected defaults(): Defaults<StaffMemberIngredients> {
    return {
      id: sequence('staff-member'),
      bornAt: new Date('2026-01-01T00:00:00.000Z'),
      name: 'Ada Lovelace',
      email: 'ada.lovelace@bank.test',
    };
  }

  protected construct(ingredients: StaffMemberIngredients): StaffMember {
    return StaffMember.create(ingredients.id, ingredients.name, ingredients.email, ingredients.bornAt);
  }
}

export function aStaffMember(): StaffMemberBuilder {
  return new StaffMemberBuilder();
}
