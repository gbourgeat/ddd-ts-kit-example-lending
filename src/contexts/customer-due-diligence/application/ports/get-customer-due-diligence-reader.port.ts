import type { AccessScope } from '@ddd-ts-kit/auth';
import type { GetCustomerDueDiligenceResult } from '@/contexts/customer-due-diligence/application/queries/get-customer-due-diligence/get-customer-due-diligence.result';

export abstract class GetCustomerDueDiligenceReader {
  abstract read(customerId: string, scope: AccessScope): Promise<GetCustomerDueDiligenceResult>;
}
