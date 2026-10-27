import { ValueObject } from '@ddd-ts-kit/kernel';
import { DelegationLevel } from '@/contexts/credit-policy/domain/vocabularies/delegation-level.vocabulary';
import { InvalidDelegationTable } from '@/contexts/credit-policy/domain/errors/invalid-delegation-table.error';

export type DelegationLimitProps = {
  readonly level: DelegationLevel;
  readonly amountCents: number;
};

const DELEGATION_LEVELS: readonly string[] = Object.values(DelegationLevel);

/** The amount, in whole cents, up to which one level of the delegation table may decide. */
export class DelegationLimit extends ValueObject<DelegationLimitProps> {
  private constructor(props: DelegationLimitProps) {
    super(props);
  }

  static create(props: DelegationLimitProps): DelegationLimit {
    if (!DELEGATION_LEVELS.includes(props.level)) {
      throw InvalidDelegationTable.forLimit(props.level, props.amountCents);
    }

    if (!Number.isInteger(props.amountCents) || props.amountCents < 0) {
      throw InvalidDelegationTable.forLimit(props.level, props.amountCents);
    }

    return new DelegationLimit(props);
  }

  get level(): DelegationLevel {
    return this.props.level;
  }

  get amountCents(): number {
    return this.props.amountCents;
  }
}
