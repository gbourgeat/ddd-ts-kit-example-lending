import type { Access, AccessScope } from '@ddd-ts-kit/auth';
import type { QueryHandler } from '@ddd-ts-kit/kernel';
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
    const scope = await this.access.scope(
      query.actor,
      customerDueDiligencePermissions['customer.read-risk'],
      'context',
    );

    return this.reader.read(query.customerId, operatorsReadAll(scope));
  }
}

/** An operator of the context, granted on the context itself, reads every rating of it; any other scope is kept. */
function operatorsReadAll(scope: AccessScope): AccessScope {
  return scope.kind === 'ids' && scope.ids.includes(CONTEXT) ? { kind: 'all' } : scope;
}
