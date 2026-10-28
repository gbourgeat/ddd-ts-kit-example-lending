import type { PersonalDataErasure } from '@/contexts/customer-due-diligence/application/ports/personal-data-erasure.port';

export class FakePersonalDataErasure implements PersonalDataErasure {
  /** The customers asked to be erased, in the order the erasures were asked. */
  readonly erased: string[] = [];

  async erase(customerId: string): Promise<void> {
    this.erased.push(customerId);
  }
}
