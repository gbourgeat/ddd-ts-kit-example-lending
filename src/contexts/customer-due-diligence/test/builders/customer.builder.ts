import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import { CustomerIdentified } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';
import type { CustomerEvent } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';

interface CustomerIngredients {
  readonly id: string;
  readonly bornAt: Date;
  readonly history: readonly CustomerEvent[];
}

/** Builds Customer the way a load does: by replaying a history of events. */
export class CustomerBuilder extends Builder<CustomerIngredients, Customer> {
  identifiedBy(id: string): this {
    return this.with('id', id);
  }

  bornAt(instant: Date): this {
    return this.with('bornAt', instant);
  }

  /** The events that follow the birth, in the order the history holds them. */
  withEvents(events: readonly CustomerEvent[]): this {
    return this.with('history', events);
  }

  protected defaults(): Defaults<CustomerIngredients> {
    return { id: sequence('customer'), bornAt: new Date('2026-01-01T00:00:00.000Z'), history: [] };
  }

  protected construct(ingredients: CustomerIngredients): Customer {
    return Customer.rehydrate(ingredients.id, {
      events: [new CustomerIdentified(ingredients.id, ingredients.bornAt), ...ingredients.history],
    });
  }
}

export function aCustomer(): CustomerBuilder {
  return new CustomerBuilder();
}
