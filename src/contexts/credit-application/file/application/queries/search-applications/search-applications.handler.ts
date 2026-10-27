import type { Access } from '@ddd-ts-kit/auth';
import type { QueryHandler } from '@ddd-ts-kit/kernel';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import type { SearchApplicationsReader } from '@/contexts/credit-application/file/application/ports/search-applications-reader.port';
import type { SearchApplicationsQuery } from '@/contexts/credit-application/file/application/queries/search-applications/search-applications.query';
import type { SearchApplicationsResult } from '@/contexts/credit-application/file/application/queries/search-applications/search-applications.result';

export class SearchApplicationsHandler implements QueryHandler<SearchApplicationsQuery> {
  constructor(
    private readonly reader: SearchApplicationsReader,
    private readonly access: Access,
  ) {}

  async execute(query: SearchApplicationsQuery): Promise<SearchApplicationsResult> {
    const scope = await this.access.scope(query.actor, creditApplicationPermissions['application.read'], 'application');

    return this.reader.search(scope, query.page);
  }
}
