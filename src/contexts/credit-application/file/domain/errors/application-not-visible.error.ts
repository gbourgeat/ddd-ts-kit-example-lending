import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { AccessRule } from '@/contexts/credit-application/file/domain/vocabularies/access-rule.vocabulary';

/** Each rule in the words a broker or an advisor reads: the name of the rule, never the content of the file. */
const reasons: Record<AccessRule, string> = {
  [AccessRule.DeclaredConflict]: 'a declared conflict of interest',
  [AccessRule.NotInPortfolio]: 'not in your portfolio',
  [AccessRule.NotBroughtByYou]: 'not brought by you',
};

export class ApplicationNotVisible extends DomainRefusal {
  readonly code = CreditApplicationCodes.ApplicationNotVisible;

  static forApplicationNotVisible(rules: readonly AccessRule[]) {
    return ApplicationNotVisible.refusal(messageOf(rules), { rules }).exposing('rules');
  }
}

function messageOf(rules: readonly AccessRule[]): string {
  if (rules.length === 0) {
    return 'You may not see this application.';
  }

  return `You may not see this application: ${rules.map((rule) => reasons[rule]).join(', ')}.`;
}
