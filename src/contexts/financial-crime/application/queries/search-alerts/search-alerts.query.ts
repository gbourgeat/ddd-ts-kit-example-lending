import { AuthorizedQuery, type Actor, type PageRequest } from '@ddd-ts-kit/kernel';
import type {
  SearchAlertsResult,
  SearchAlertsSort,
} from '@/contexts/financial-crime/application/queries/search-alerts/search-alerts.result';

export class SearchAlertsQuery extends AuthorizedQuery<SearchAlertsResult> {
  constructor(
    actor: Actor,
    readonly page: PageRequest<SearchAlertsSort>,
  ) {
    super(actor);
  }
}
