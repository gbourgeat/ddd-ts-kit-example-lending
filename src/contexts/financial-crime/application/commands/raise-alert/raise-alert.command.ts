import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';
import type { AlertRuleService } from '@/contexts/financial-crime/domain/services/alert-rule.service';

/** The facts of a repayment the alert rules read. */
export type RepaymentFacts = Parameters<AlertRuleService['evaluate']>[0];

/** Raises an alert on a repayment when the facts of the repayment break a rule of the alert rules. */
export class RaiseAlertCommand extends AuthorizedCommand<string | undefined> {
  constructor(
    actor: Actor,
    readonly repaymentReference: string,
    readonly facts: RepaymentFacts,
  ) {
    super(actor);
  }
}
