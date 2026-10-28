import { eraseDataSubject, type SubjectKeyStore } from '@ddd-ts-kit/kernel';
import type { PersonalDataErasure } from '@/contexts/customer-due-diligence/application/ports/personal-data-erasure.port';

/**
 * Erases a customer by destroying the key its personal values are sealed with in the event store: its stored
 * events then read them as erased. The platform audits the keys, so each erasure leaves its entry.
 * The class keeps the name the generator gave the adapter; the erasure itself is in-process, not a call out.
 */
export class RemotePersonalDataErasure implements PersonalDataErasure {
  constructor(private readonly keys: SubjectKeyStore) {}

  async erase(customerId: string): Promise<void> {
    await eraseDataSubject(customerId, { keys: this.keys });
  }
}
