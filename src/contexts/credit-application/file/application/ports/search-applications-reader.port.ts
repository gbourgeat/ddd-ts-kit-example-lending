import type { AccessScope } from '@ddd-ts-kit/auth';
import type { PageRequest } from '@ddd-ts-kit/kernel';
import type {
  SearchApplicationsResult,
  SearchApplicationsSort,
} from '@/contexts/credit-application/file/application/queries/search-applications/search-applications.result';

export abstract class SearchApplicationsReader {
  abstract search(scope: AccessScope, page: PageRequest<SearchApplicationsSort>): Promise<SearchApplicationsResult>;
}
