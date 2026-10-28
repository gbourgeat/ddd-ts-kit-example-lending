import type { Access, AccessScope } from '@ddd-ts-kit/auth';
import type { QueryHandler } from '@ddd-ts-kit/kernel';
import { customerDueDiligencePermissions } from '@/contexts/customer-due-diligence/customer-due-diligence.permissions';
import type { GetCustomerDueDiligenceReader } from '@/contexts/customer-due-diligence/application/ports/get-customer-due-diligence-reader.port';
import type { GetCustomerDueDiligenceQuery } from '@/contexts/customer-due-diligence/application/queries/get-customer-due-diligence/get-customer-due-diligence.query';
import type { GetCustomerDueDiligenceResult } from '@/contexts/customer-due-diligence/application/queries/get-customer-due-diligence/get-customer-due-diligence.result';

const CONTEXT = 'customer-due-diligence';

export class GetCustomerDueDiligenceHandler implements QueryHandler<GetCustomerDueDiligenceQuery> {
  constructor(
    private readonly reader: GetCustomerDueDiligenceReader,
    private readonly access: Access,
  ) {}

  async execute(query: GetCustomerDueDiligenceQuery): Promise<GetCustomerDueDiligenceResult> {
    const scope = await this.access.scope(
      query.actor,
      customerDueDiligencePermissions['due-diligence.read'],
      'context',
    );

    return this.reader.read(query.customerId, operatorsReadAll(scope));
  }
}

/** An operator of the context, granted on the context itself, reads every due diligence of it; any other scope is kept. */
function operatorsReadAll(scope: AccessScope): AccessScope {
  return scope.kind === 'ids' && scope.ids.includes(CONTEXT) ? { kind: 'all' } : scope;
}
