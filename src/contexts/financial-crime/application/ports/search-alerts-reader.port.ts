import type { AccessScope } from '@ddd-ts-kit/auth';
import type { PageRequest } from '@ddd-ts-kit/kernel';
import type {
  SearchAlertsResult,
  SearchAlertsSort,
} from '@/contexts/financial-crime/application/queries/search-alerts/search-alerts.result';

export abstract class SearchAlertsReader {
  abstract search(scope: AccessScope, page: PageRequest<SearchAlertsSort>): Promise<SearchAlertsResult>;
}
