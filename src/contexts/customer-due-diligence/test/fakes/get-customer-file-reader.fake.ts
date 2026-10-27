import type { AccessScope } from '@ddd-ts-kit/auth';
import { pageOf, type PageRequest } from '@ddd-ts-kit/kernel';
import type { GetCustomerFileReader } from '@/contexts/customer-due-diligence/application/ports/get-customer-file-reader.port';
import type {
  GetCustomerFileItem,
  GetCustomerFileResult,
  GetCustomerFileSort,
} from '@/contexts/customer-due-diligence/application/queries/get-customer-file/get-customer-file.result';

/** The customer file read model in memory: it shows the files its scope covers, and keeps the last scope it was asked for. */
export class FakeGetCustomerFileReader implements GetCustomerFileReader {
  lastScope: AccessScope | undefined;

  constructor(private readonly files: readonly GetCustomerFileItem[]) {}

  async search(scope: AccessScope, page: PageRequest<GetCustomerFileSort>): Promise<GetCustomerFileResult> {
    this.lastScope = scope;

    const visible = scope.kind === 'all' ? this.files : [];

    if (page.kind !== 'offset') {
      return pageOf(visible.slice(0, page.limit), {});
    }

    return pageOf(visible.slice(page.offset, page.offset + page.limit), { total: visible.length });
  }
}
