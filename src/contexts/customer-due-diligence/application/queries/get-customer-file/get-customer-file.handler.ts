import type { Access } from '@ddd-ts-kit/auth';
import type { QueryHandler } from '@ddd-ts-kit/kernel';
import { customerDueDiligencePermissions } from '@/contexts/customer-due-diligence/customer-due-diligence.permissions';
import type { GetCustomerFileReader } from '@/contexts/customer-due-diligence/application/ports/get-customer-file-reader.port';
import type { GetCustomerFileQuery } from '@/contexts/customer-due-diligence/application/queries/get-customer-file/get-customer-file.query';
import type { GetCustomerFileResult } from '@/contexts/customer-due-diligence/application/queries/get-customer-file/get-customer-file.result';

export class GetCustomerFileHandler implements QueryHandler<GetCustomerFileQuery> {
  constructor(
    private readonly reader: GetCustomerFileReader,
    private readonly access: Access,
  ) {}

  async execute(query: GetCustomerFileQuery): Promise<GetCustomerFileResult> {
    // TODO(domain): name the searched element as the authorization model knows it, in place of 'customer'; the scope it answers is handed to the read port, which filters in the statement and never in memory after loading.
    const scope = await this.access.scope(query.actor, customerDueDiligencePermissions['customer.read'], 'customer');

    return this.reader.search(scope, query.page);
  }
}
