import type { Access, AccessScope } from '@ddd-ts-kit/auth';
import type { Actor, QueryHandler } from '@ddd-ts-kit/kernel';
import { customerDueDiligencePermissions } from '@/contexts/customer-due-diligence/customer-due-diligence.permissions';
import type { GetCustomerRiskRatingReader } from '@/contexts/customer-due-diligence/application/ports/get-customer-risk-rating-reader.port';
import type { GetCustomerRiskRatingQuery } from '@/contexts/customer-due-diligence/application/queries/get-customer-risk-rating/get-customer-risk-rating.query';
import type { GetCustomerRiskRatingResult } from '@/contexts/customer-due-diligence/application/queries/get-customer-risk-rating/get-customer-risk-rating.result';

const CONTEXT = 'customer-due-diligence';

export class GetCustomerRiskRatingHandler implements QueryHandler<GetCustomerRiskRatingQuery> {
  constructor(
    private readonly reader: GetCustomerRiskRatingReader,
    private readonly access: Access,
  ) {}

  async execute(query: GetCustomerRiskRatingQuery): Promise<GetCustomerRiskRatingResult> {
    const scope = await this.readableScope(query.actor);

    return this.reader.read(query.customerId, scope);
  }

  /** An operator of the context reads every rating; any other actor reads the ratings of the customers of its portfolios. */
  private async readableScope(actor: Actor): Promise<AccessScope> {
    const onContext = await this.access.scope(actor, customerDueDiligencePermissions['customer.read-risk'], 'context');

    if (onContext.kind === 'all' || (onContext.kind === 'ids' && onContext.ids.includes(CONTEXT))) {
      return { kind: 'all' };
    }

    return this.access.scope(actor, customerDueDiligencePermissions['customer.view-risk'], 'customer');
  }
}
