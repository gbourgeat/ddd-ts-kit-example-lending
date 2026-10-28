import type { Actor } from '@ddd-ts-kit/kernel';
import type { AccessStep, AccessExplainer } from '@/platform/auth/authorization/access-explainer';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import type { AccessExplanations } from '@/contexts/credit-application/file/application/ports/access-explanations.port';
import { AccessRule } from '@/contexts/credit-application/file/domain/vocabularies/access-rule.vocabulary';

/** The words of the questions the relationships are asked, as the platform's explainer writes them. */
const CONFLICTED_OF = ' is conflicted of ';
const ADVISOR_OF = ' is advisor of ';
const NO_PORTFOLIO = ' has no portfolio';
const BROKER_OF = ' is broker of ';

/** Explains from the relationships of the platform, in process: it names the rules and never the questions' ids or texts. */
export class RemoteAccessExplanations implements AccessExplanations {
  constructor(private readonly explainer: AccessExplainer) {}

  async refusingRules(actor: Actor, applicationId: string): Promise<readonly AccessRule[]> {
    const steps = await this.explainer.explain(actor, creditApplicationPermissions['application.read'], {
      type: 'application',
      id: applicationId,
    });

    return rulesOf(steps);
  }
}

/** A declared conflict that holds is the reason, whatever else was asked; otherwise each question that does not hold names its rule. */
function rulesOf(steps: readonly AccessStep[]): AccessRule[] {
  if (steps.some((step) => step.holds && step.text.includes(CONFLICTED_OF))) {
    return [AccessRule.DeclaredConflict];
  }

  const rules = new Set<AccessRule>();

  for (const step of steps) {
    if (!step.holds && (step.text.includes(ADVISOR_OF) || step.text.includes(NO_PORTFOLIO))) {
      rules.add(AccessRule.NotInPortfolio);
    }

    if (!step.holds && step.text.includes(BROKER_OF)) {
      rules.add(AccessRule.NotBroughtByYou);
    }
  }

  return [...rules];
}
