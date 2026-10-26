import type { OutboxStore } from '@ddd-ts-kit/events';
import type {
  EventSourcingStores,
  ExecutionScope,
  ProcessedEventStore,
  ProcessStore,
  UnitOfWork,
} from '@ddd-ts-kit/kernel';
import type { Database } from '@/platform/database/database';

/** Where state lives and how a command is made atomic. The composition root binds each member to its port. */
export interface Persistence {
  readonly unitOfWork: UnitOfWork;
  readonly outbox: OutboxStore;
  readonly processedEvents: ProcessedEventStore;
  /** The instances of the process managers, saved in the transaction of each step, each in the tenant of the work `scope` runs. */
  readonly processes: (scope: ExecutionScope) => ProcessStore;
  /** What repositories query through: the transaction of the current unit of work, or the database. */
  readonly database: Database;
  /**
   * The event store, the snapshots, the checkpoints of the projections it feeds and the keys of the
   * data subjects, in the `event_store` schema: what an event-sourced aggregate is loaded and saved
   * through, and what seals its personal values. The platform binds each store to its port.
   * It is given the execution scope: each stream keeps the tenant of the work that first appended to it.
   */
  readonly eventSourcing: (scope: ExecutionScope) => EventSourcingStores;

  close(): Promise<void>;
}
