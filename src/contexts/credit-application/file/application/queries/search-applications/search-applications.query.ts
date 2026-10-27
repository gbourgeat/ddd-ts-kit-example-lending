import { AuthorizedQuery, type Actor, type PageRequest } from '@ddd-ts-kit/kernel';
import type {
  SearchApplicationsResult,
  SearchApplicationsSort,
} from '@/contexts/credit-application/file/application/queries/search-applications/search-applications.result';

/** A list has no criteria: what the caller may see is the access scope the reader narrows to, and the page. */
export class SearchApplicationsQuery extends AuthorizedQuery<SearchApplicationsResult> {
  constructor(
    actor: Actor,
    readonly page: PageRequest<SearchApplicationsSort>,
  ) {
    super(actor);
  }
}
