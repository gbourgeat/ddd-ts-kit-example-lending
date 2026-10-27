import type { AccessScope } from '@ddd-ts-kit/auth';
import type { PageRequest } from '@ddd-ts-kit/kernel';
import type {
  GetCustomerFileResult,
  GetCustomerFileSort,
} from '@/contexts/customer-due-diligence/application/queries/get-customer-file/get-customer-file.result';

export abstract class GetCustomerFileReader {
  abstract search(scope: AccessScope, page: PageRequest<GetCustomerFileSort>): Promise<GetCustomerFileResult>;
}
