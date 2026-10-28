import type { Access } from '@ddd-ts-kit/auth';
import type { QueryHandler } from '@ddd-ts-kit/kernel';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import type { AccessExplanations } from '@/contexts/credit-application/file/application/ports/access-explanations.port';
import type { ExplainRefusalQuery } from '@/contexts/credit-application/file/application/queries/explain-refusal/explain-refusal.query';
import type { ExplainRefusalResult } from '@/contexts/credit-application/file/application/queries/explain-refusal/explain-refusal.result';
import { ApplicationNotVisible } from '@/contexts/credit-application/file/domain/errors/application-not-visible.error';

/** A visible application is answered as visible, without content; any other is refused with the rules that refuse it, named, never its file. */
export class ExplainRefusalHandler implements QueryHandler<ExplainRefusalQuery> {
  constructor(
    private readonly access: Access,
    private readonly explanations: AccessExplanations,
  ) {}

  async execute(query: ExplainRefusalQuery): Promise<ExplainRefusalResult> {
    const permission = creditApplicationPermissions['application.read'];

    const decision = await this.access.decide(query.actor, permission, {
      type: 'application',
      id: query.applicationId,
    });

    if (decision.allowed) {
      return { outcome: 'visible' };
    }

    const rules = await this.explanations.refusingRules(query.actor, query.applicationId);

    throw ApplicationNotVisible.forApplicationNotVisible(rules);
  }
}
