import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { Broker } from '@/contexts/brokerage/domain/aggregates/broker.aggregate';

interface BrokerIngredients {
  readonly id: string;
  readonly bornAt: Date;
  readonly registrationNumber: string;
}

export class BrokerBuilder extends Builder<BrokerIngredients, Broker> {
  identifiedBy(id: string): this {
    return this.with('id', id);
  }

  bornAt(instant: Date): this {
    return this.with('bornAt', instant);
  }

  numbered(registrationNumber: string): this {
    return this.with('registrationNumber', registrationNumber);
  }

  protected defaults(): Defaults<BrokerIngredients> {
    return {
      id: sequence('broker'),
      bornAt: new Date('2026-01-01T00:00:00.000Z'),
      registrationNumber: 'REG-0001',
    };
  }

  protected construct(ingredients: BrokerIngredients): Broker {
    return Broker.create(ingredients.id, ingredients.registrationNumber, ingredients.bornAt);
  }
}

export function aBroker(): BrokerBuilder {
  return new BrokerBuilder();
}
