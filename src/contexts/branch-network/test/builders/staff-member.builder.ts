import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { StaffMember } from '@/contexts/branch-network/domain/aggregates/staff-member.aggregate';

interface StaffMemberIngredients {
  readonly id: string;
  readonly bornAt: Date;
  readonly branchId: string;
  readonly name: string;
  readonly email: string;
  readonly accountId: string;
  readonly level: string;
  readonly ownCustomerId: string | undefined;
}

export class StaffMemberBuilder extends Builder<StaffMemberIngredients, StaffMember> {
  identifiedBy(id: string): this {
    return this.with('id', id);
  }

  bornAt(instant: Date): this {
    return this.with('bornAt', instant);
  }

  onBranch(branchId: string): this {
    return this.with('branchId', branchId);
  }

  named(name: string): this {
    return this.with('name', name);
  }

  reachableAt(email: string): this {
    return this.with('email', email);
  }

  signedInAs(accountId: string): this {
    return this.with('accountId', accountId);
  }

  atLevel(level: string): this {
    return this.with('level', level);
  }

  ownsCustomerFile(customerId: string): this {
    return this.with('ownCustomerId', customerId);
  }

  protected defaults(): Defaults<StaffMemberIngredients> {
    return {
      id: sequence('staff-member'),
      bornAt: new Date('2026-01-01T00:00:00.000Z'),
      branchId: 'branch-1',
      name: 'Ada Lovelace',
      email: 'ada.lovelace@bank.test',
      accountId: 'account-ada',
      level: 'advisor',
      ownCustomerId: undefined,
    };
  }

  protected construct(ingredients: StaffMemberIngredients): StaffMember {
    return StaffMember.create(
      ingredients.id,
      {
        branchId: ingredients.branchId,
        name: ingredients.name,
        email: ingredients.email,
        accountId: ingredients.accountId,
        level: ingredients.level,
        ownCustomerId: ingredients.ownCustomerId,
      },
      ingredients.bornAt,
    );
  }
}

export function aStaffMember(): StaffMemberBuilder {
  return new StaffMemberBuilder();
}
