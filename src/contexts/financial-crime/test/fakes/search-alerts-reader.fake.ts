import type { AccessScope } from '@ddd-ts-kit/auth';
import { pageOf } from '@ddd-ts-kit/kernel';
import type { SearchAlertsReader } from '@/contexts/financial-crime/application/ports/search-alerts-reader.port';
import type {
  SearchAlertsItem,
  SearchAlertsResult,
} from '@/contexts/financial-crime/application/queries/search-alerts/search-alerts.result';

/** A working list: what it holds is shown to the scope of all, and to no other. */
export class FakeSearchAlertsReader implements SearchAlertsReader {
  constructor(private readonly alerts: readonly SearchAlertsItem[] = []) {}

  async search(scope: AccessScope): Promise<SearchAlertsResult> {
    return pageOf(scope.kind === 'all' ? this.alerts : []);
  }
}
