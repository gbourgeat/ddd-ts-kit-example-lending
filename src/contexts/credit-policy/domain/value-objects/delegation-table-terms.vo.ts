import { ValueObject } from '@ddd-ts-kit/kernel';
import { InvalidDelegationTable } from '@/contexts/credit-policy/domain/errors/invalid-delegation-table.error';
import { DelegationLevel } from '@/contexts/credit-policy/domain/vocabularies/delegation-level.vocabulary';
import type { DelegationLimit } from '@/contexts/credit-policy/domain/value-objects/delegation-limit.vo';

export type DelegationTableTermsProps = {
  readonly effectiveFrom: Date;
  readonly limits: readonly DelegationLimit[];
};

const DELEGATION_LEVELS: readonly string[] = Object.values(DelegationLevel);

/** The limits of every level of a delegation table, each level once, and the day the table takes effect. */
export class DelegationTableTerms extends ValueObject<DelegationTableTermsProps> {
  private constructor(props: DelegationTableTermsProps) {
    super(props);
  }

  static create(props: DelegationTableTermsProps): DelegationTableTerms {
    const levels = props.limits.map((limit) => limit.level);
    const everyLevelOnce = DELEGATION_LEVELS.every((level) => levels.filter((named) => named === level).length === 1);

    if (levels.length !== DELEGATION_LEVELS.length || !everyLevelOnce) {
      throw InvalidDelegationTable.forLevels(levels);
    }

    return new DelegationTableTerms(props);
  }

  get effectiveFrom(): Date {
    return this.props.effectiveFrom;
  }

  get limits(): readonly DelegationLimit[] {
    return this.props.limits;
  }
}
