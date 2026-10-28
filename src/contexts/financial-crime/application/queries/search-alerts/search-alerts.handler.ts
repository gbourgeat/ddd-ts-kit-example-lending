import type { Access, AccessScope } from '@ddd-ts-kit/auth';
import type { QueryHandler } from '@ddd-ts-kit/kernel';
import { financialCrimePermissions } from '@/contexts/financial-crime/financial-crime.permissions';
import type { SearchAlertsReader } from '@/contexts/financial-crime/application/ports/search-alerts-reader.port';
import type { SearchAlertsQuery } from '@/contexts/financial-crime/application/queries/search-alerts/search-alerts.query';
import type { SearchAlertsResult } from '@/contexts/financial-crime/application/queries/search-alerts/search-alerts.result';

export class SearchAlertsHandler implements QueryHandler<SearchAlertsQuery> {
  constructor(
    private readonly reader: SearchAlertsReader,
    private readonly access: Access,
  ) {}

  async execute(query: SearchAlertsQuery): Promise<SearchAlertsResult> {
    const scope = await this.access.scope(query.actor, financialCrimePermissions['alert.read'], 'context');

    return this.reader.search(this.visibleTo(scope), query.page);
  }

  /** Alerts are the compliance group's: the operators of financial-crime see all of them, any other caller sees none. */
  private visibleTo(scope: AccessScope): AccessScope {
    return scope.kind === 'all' || (scope.kind === 'ids' && scope.ids.includes('financial-crime'))
      ? { kind: 'all' }
      : { kind: 'none' };
  }
}
