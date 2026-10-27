import { ValueObject } from '@ddd-ts-kit/kernel';
import { InvalidMoney } from '@/shared-kernel/invalid-money.error';

export type MoneyProps = {
  readonly cents: number;
};

/** An amount of euros in whole cents: a ledger never keeps a fraction, so no floating point is held. */
export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props);
  }

  static ofCents(cents: number): Money {
    if (!Number.isSafeInteger(cents)) {
      throw InvalidMoney.forCents(cents);
    }

    return new Money({ cents });
  }

  get cents(): number {
    return this.props.cents;
  }
}
