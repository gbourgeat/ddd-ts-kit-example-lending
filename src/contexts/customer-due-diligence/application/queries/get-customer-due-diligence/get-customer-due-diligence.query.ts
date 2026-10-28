import { AuthorizedQuery, type Actor } from '@ddd-ts-kit/kernel';
import type { GetCustomerDueDiligenceResult } from '@/contexts/customer-due-diligence/application/queries/get-customer-due-diligence/get-customer-due-diligence.result';

/** Reads the dates of the last refresh of the due diligence of a customer and the date it falls due again. */
export class GetCustomerDueDiligenceQuery extends AuthorizedQuery<GetCustomerDueDiligenceResult> {
  constructor(
    actor: Actor,
    readonly customerId: string,
  ) {
    super(actor);
  }
}
