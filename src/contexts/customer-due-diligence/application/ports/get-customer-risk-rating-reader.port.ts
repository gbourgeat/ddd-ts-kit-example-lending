import type { AccessScope } from '@ddd-ts-kit/auth';
import type { GetCustomerRiskRatingResult } from '@/contexts/customer-due-diligence/application/queries/get-customer-risk-rating/get-customer-risk-rating.result';

export abstract class GetCustomerRiskRatingReader {
  abstract read(customerId: string, scope: AccessScope): Promise<GetCustomerRiskRatingResult>;
}
