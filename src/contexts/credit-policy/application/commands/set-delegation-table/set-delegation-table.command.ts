import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';
import type { DelegationLevel } from '@/contexts/credit-policy/domain/vocabularies/delegation-level.vocabulary';

export class SetDelegationTableCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly terms: {
      readonly effectiveFrom: Date;
      readonly limits: readonly {
        readonly level: DelegationLevel;
        readonly amountCents: number;
      }[];
    },
  ) {
    super(actor);
  }
}
