import type { Access, AccessScope } from '@ddd-ts-kit/auth';
import type { QueryHandler } from '@ddd-ts-kit/kernel';
import { customerDueDiligencePermissions } from '@/contexts/customer-due-diligence/customer-due-diligence.permissions';
import type { GetCustomerFileReader } from '@/contexts/customer-due-diligence/application/ports/get-customer-file-reader.port';
import type { GetCustomerFileQuery } from '@/contexts/customer-due-diligence/application/queries/get-customer-file/get-customer-file.query';
import type { GetCustomerFileResult } from '@/contexts/customer-due-diligence/application/queries/get-customer-file/get-customer-file.result';

const CONTEXT = 'customer-due-diligence';

export class GetCustomerFileHandler implements QueryHandler<GetCustomerFileQuery> {
  constructor(
    private readonly reader: GetCustomerFileReader,
    private readonly access: Access,
  ) {}

  async execute(query: GetCustomerFileQuery): Promise<GetCustomerFileResult> {
    const granted = await this.access.scope(query.actor, customerDueDiligencePermissions['customer.read'], 'context');

    return this.reader.search(operatorsReadAll(granted), query.page);
  }
}

/** An operator of the context, granted on the context itself, reads every customer file of it; any other scope is kept. */
function operatorsReadAll(scope: AccessScope): AccessScope {
  return scope.kind === 'ids' && scope.ids.includes(CONTEXT) ? { kind: 'all' } : scope;
}
