import type { Actor } from '@ddd-ts-kit/kernel';
import type { AccessRule } from '@/contexts/credit-application/file/domain/vocabularies/access-rule.vocabulary';

/** Why an actor may not read an application, given as the names of the rules that refuse it: never the facts the relationships were asked with. */
export abstract class AccessExplanations {
  /** The rules that refuse the actor the application, none when no rule refuses it. */
  abstract refusingRules(actor: Actor, applicationId: string): Promise<readonly AccessRule[]>;
}
