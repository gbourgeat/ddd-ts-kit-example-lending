import { AuthorizedQuery, type Actor, type PageRequest } from '@ddd-ts-kit/kernel';
import type {
  SearchMembersResult,
  SearchMembersSort,
} from '@/contexts/identity/application/queries/search-members/search-members.result';

/** One page of the current members of an organisation, for its members. */
export class SearchMembersQuery extends AuthorizedQuery<SearchMembersResult> {
  constructor(
    actor: Actor,
    readonly organisationId: string,
    readonly page: PageRequest<SearchMembersSort>,
  ) {
    super(actor);
  }
}
