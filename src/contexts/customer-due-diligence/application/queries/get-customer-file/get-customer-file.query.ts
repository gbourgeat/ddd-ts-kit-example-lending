import { AuthorizedQuery, type Actor, type PageRequest } from '@ddd-ts-kit/kernel';
import type {
  GetCustomerFileResult,
  GetCustomerFileSort,
} from '@/contexts/customer-due-diligence/application/queries/get-customer-file/get-customer-file.result';

export class GetCustomerFileQuery extends AuthorizedQuery<GetCustomerFileResult> {
  // TODO(domain): add the criteria of "get customer file" as readonly primitives after the page (a status, a period).
  constructor(
    actor: Actor,
    readonly page: PageRequest<GetCustomerFileSort>,
  ) {
    super(actor);
  }
}
