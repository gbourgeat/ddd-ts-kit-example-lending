import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import {
  CustomerIdentified,
  type PersonIdentity,
} from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';
import type { CustomerEvent } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import { IdentityDocumentKind } from '@/contexts/customer-due-diligence/domain/vocabularies/identity-document-kind.vocabulary';

interface CustomerIngredients {
  readonly id: string;
  readonly bornAt: Date;
  readonly identity: PersonIdentity;
  readonly history: readonly CustomerEvent[];
}

/** A person whose passport is valid until 2030 and whose proof of address is dated 1st January 2026. */
export function aPersonIdentity(overrides: Partial<PersonIdentity> = {}): PersonIdentity {
  return {
    documentKind: IdentityDocumentKind.Passport,
    documentNumber: '12AB34567',
    issuingCountry: 'FR',
    documentExpiresOn: new Date('2030-01-01T00:00:00.000Z'),
    address: '1 rue de la Paix, 75002 Paris',
    addressProofDatedOn: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

/** Builds Customer the way a load does: by replaying a history of events. */
export class CustomerBuilder extends Builder<CustomerIngredients, Customer> {
  identifiedBy(id: string): this {
    return this.with('id', id);
  }

  bornAt(instant: Date): this {
    return this.with('bornAt', instant);
  }

  identifiedWith(identity: PersonIdentity): this {
    return this.with('identity', identity);
  }

  /** The events that follow the birth, in the order the history holds them. */
  withEvents(events: readonly CustomerEvent[]): this {
    return this.with('history', events);
  }

  protected defaults(): Defaults<CustomerIngredients> {
    return {
      id: sequence('customer'),
      bornAt: new Date('2026-01-01T00:00:00.000Z'),
      identity: aPersonIdentity(),
      history: [],
    };
  }

  protected construct(ingredients: CustomerIngredients): Customer {
    return Customer.rehydrate(ingredients.id, {
      events: [
        new CustomerIdentified(ingredients.id, ingredients.bornAt, ingredients.identity),
        ...ingredients.history,
      ],
    });
  }
}

export function aCustomer(): CustomerBuilder {
  return new CustomerBuilder();
}
