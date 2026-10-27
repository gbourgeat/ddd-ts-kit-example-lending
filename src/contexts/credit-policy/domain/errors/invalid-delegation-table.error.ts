import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditPolicyCodes } from '@/contexts/credit-policy/credit-policy.codes';

export class InvalidDelegationTable extends DomainRefusal {
  readonly code = CreditPolicyCodes.InvalidDelegationTable;

  static forLimit(level: string, amountCents: number) {
    return InvalidDelegationTable.refusal(
      'A delegation limit is a whole amount of cents, from 0, for one of the four levels.',
      { level, amountCents },
    ).exposing('level', 'amountCents');
  }

  static forLevels(levels: readonly string[]) {
    return InvalidDelegationTable.refusal('A delegation table gives a limit to each of the four levels, once.', {
      levels,
    }).exposing('levels');
  }
}
