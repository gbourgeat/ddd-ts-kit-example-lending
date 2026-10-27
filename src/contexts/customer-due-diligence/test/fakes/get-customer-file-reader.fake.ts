import type { GetCustomerFileItem } from '@/contexts/customer-due-diligence/application/queries/get-customer-file/get-customer-file.result';
import { InMemoryGetCustomerFileReader } from '@/contexts/customer-due-diligence/infrastructure/persistence/in-memory-get-customer-file.reader';

export class FakeGetCustomerFileReader extends InMemoryGetCustomerFileReader {
  constructor(protected override readonly getCustomerFiles: readonly GetCustomerFileItem[]) {
    super();
  }
}
