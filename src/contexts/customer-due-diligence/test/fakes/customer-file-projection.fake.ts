import type { CustomerFileProjection } from '@/contexts/customer-due-diligence/application/ports/customer-file-projection.port';

/** The customer file read model in memory: it keeps what it was asked to record, for a test to assert on. */
export class FakeCustomerFileProjection implements CustomerFileProjection {
  readonly recorded: { readonly customerId: string; readonly identifiedOn: Date }[] = [];

  async recordIdentified(customerId: string, identifiedOn: Date): Promise<void> {
    this.recorded.push({ customerId, identifiedOn });
  }
}
