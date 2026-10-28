import type { GetCustomerDueDiligenceReader } from '@/contexts/customer-due-diligence/application/ports/get-customer-due-diligence-reader.port';
import type { GetCustomerDueDiligenceResult } from '@/contexts/customer-due-diligence/application/queries/get-customer-due-diligence/get-customer-due-diligence.result';

export class FakeGetCustomerDueDiligenceReader implements GetCustomerDueDiligenceReader {
  constructor(private readonly answer: GetCustomerDueDiligenceResult) {}

  read(): Promise<GetCustomerDueDiligenceResult> {
    return Promise.resolve(this.answer);
  }
}
