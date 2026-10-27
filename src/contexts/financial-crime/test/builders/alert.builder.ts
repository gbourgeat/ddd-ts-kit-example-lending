import { Builder, sequence, type Defaults } from '@ddd-ts-kit/testing';
import { Alert } from '@/contexts/financial-crime/domain/aggregates/alert.aggregate';

interface AlertIngredients {
  readonly id: string;
  readonly bornAt: Date;
  readonly repaymentReference: string;
}

export class AlertBuilder extends Builder<AlertIngredients, Alert> {
  identifiedBy(id: string): this {
    return this.with('id', id);
  }

  bornAt(instant: Date): this {
    return this.with('bornAt', instant);
  }

  ofRepayment(repaymentReference: string): this {
    return this.with('repaymentReference', repaymentReference);
  }

  protected defaults(): Defaults<AlertIngredients> {
    return {
      id: sequence('alert'),
      bornAt: new Date('2026-01-01T00:00:00.000Z'),
      repaymentReference: 'repayment-1',
    };
  }

  protected construct(ingredients: AlertIngredients): Alert {
    return Alert.create(ingredients.id, ingredients.repaymentReference, ingredients.bornAt);
  }
}

export function anAlert(): AlertBuilder {
  return new AlertBuilder();
}
