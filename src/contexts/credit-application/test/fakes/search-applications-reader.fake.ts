import type { AccessScope } from '@ddd-ts-kit/auth';
import { pageOf, type PageRequest } from '@ddd-ts-kit/kernel';
import type { SearchApplicationsReader } from '@/contexts/credit-application/file/application/ports/search-applications-reader.port';
import type {
  SearchApplicationsItem,
  SearchApplicationsResult,
  SearchApplicationsSort,
} from '@/contexts/credit-application/file/application/queries/search-applications/search-applications.result';

/** Answers, in one page, the applications it was given that the scope shows. */
export class FakeSearchApplicationsReader implements SearchApplicationsReader {
  constructor(private readonly applications: readonly SearchApplicationsItem[]) {}

  async search(scope: AccessScope, _page: PageRequest<SearchApplicationsSort>): Promise<SearchApplicationsResult> {
    return pageOf(this.applications.filter((application) => isShown(scope, application)));
  }
}

function isShown(scope: AccessScope, application: SearchApplicationsItem): boolean {
  switch (scope.kind) {
    case 'all':
      return true;
    case 'ids':
      return scope.ids.includes(application.id);
    case 'none':
    case 'filter':
      return false;
  }
}
