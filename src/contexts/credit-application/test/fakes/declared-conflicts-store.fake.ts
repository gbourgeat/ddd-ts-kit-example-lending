import type { EventStamp } from '@ddd-ts-kit/kernel';
import type { DeclaredConflictRow } from '@/contexts/credit-application/decision/application/projections/declared-conflict-row.projection';
import type { DeclaredConflictsStore } from '@/contexts/credit-application/decision/application/ports/declared-conflicts-store.port';

interface KeptLine {
  readonly row: DeclaredConflictRow;
  readonly stamp: EventStamp;
}

export class FakeDeclaredConflictsStore implements DeclaredConflictsStore {
  private readonly lines = new Map<string, KeptLine>();

  async keep(row: DeclaredConflictRow, stamp: EventStamp): Promise<void> {
    const current = this.lines.get(row.conflictOfInterestId);

    if (current && current.stamp.occurredAt.getTime() > stamp.occurredAt.getTime()) {
      return;
    }

    this.lines.set(row.conflictOfInterestId, { row, stamp });
  }

  async find(conflictOfInterestId: string): Promise<DeclaredConflictRow | undefined> {
    return this.lines.get(conflictOfInterestId)?.row;
  }

  async searchOfCustomer(customerId: string): Promise<readonly DeclaredConflictRow[]> {
    return [...this.lines.values()].map((line) => line.row).filter((row) => row.customerId === customerId);
  }
}
