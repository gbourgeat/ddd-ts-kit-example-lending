import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import { CustomerIdentified } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';

interface CustomerIngredients {
  readonly id: string;
  readonly bornAt: Date;
}

/** Builds Customer the way a load does: by replaying a history of events. */
export class CustomerBuilder extends Builder<CustomerIngredients, Customer> {
  identifiedBy(id: string): this {
    return this.with('id', id);
  }

  bornAt(instant: Date): this {
    return this.with('bornAt', instant);
  }

  protected defaults(): Defaults<CustomerIngredients> {
    return { id: sequence('customer'), bornAt: new Date('2026-01-01T00:00:00.000Z') };
  }

  protected construct(ingredients: CustomerIngredients): Customer {
    return Customer.rehydrate(ingredients.id, {
      events: [new CustomerIdentified(ingredients.id, ingredients.bornAt)],
    });
  }
}

export function aCustomer(): CustomerBuilder {
  return new CustomerBuilder();
}
