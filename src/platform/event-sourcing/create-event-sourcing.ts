import { auditedSubjectKeys, type AuditSource } from '@ddd-ts-kit/audit';
import { PersonalDataCipher, type EventSourcingStores } from '@ddd-ts-kit/kernel';
import type { Audit } from '@/platform/audit/create-audit';
import type { Persistence } from '@/platform/database/persistence';

/**
 * The event store as the platform hands it on: the stores an event-sourced repository adapter is
 * given (the events, the snapshots, the checkpoints of the projections the store feeds), the keys
 * of the data subjects and the cipher that seals a personal value of a stored event with the key
 * of its subject. An erasure destroys the key, and every erasure leaves a dated entry in the audit
 * trail, whoever asks for it. The keys live in the `subject_keys` table of the event store: a
 * deployment that promises erasure keeps them in a store of their own, with a shorter backup
 * retention than the events (docs/concepts/event-sourcing.md of ddd-ts-kit, "Personal data").
 */
export interface EventSourcing extends EventSourcingStores {
  readonly cipher: PersonalDataCipher;
}

export function createEventSourcing(persistence: Persistence, audit: Audit, source: AuditSource): EventSourcing {
  const stores = persistence.eventSourcing(source.scope);
  const subjectKeys = auditedSubjectKeys(stores.subjectKeys, audit.trail, source);

  return { ...stores, subjectKeys, cipher: new PersonalDataCipher(subjectKeys) };
}
