import type { PersonalDataRecord } from '@ddd-ts-kit/kernel';
import type { BranchNetworkPersonalDataExport } from '@/contexts/branch-network/application/ports/branch-network-personal-data-export.port';

/** Hands over the records a test gave it of each person, and remembers who was asked. */
export class FakeBranchNetworkPersonalDataExport implements BranchNetworkPersonalDataExport {
  readonly name = 'branch-network';

  readonly asked: string[] = [];

  private readonly records = new Map<string, PersonalDataRecord[]>();

  /** What the export of this person hands over, as the test arranges it. */
  holds(subject: string, ...records: readonly PersonalDataRecord[]): this {
    this.records.set(subject, [...(this.records.get(subject) ?? []), ...records]);

    return this;
  }

  async exportOf(subject: string): Promise<readonly PersonalDataRecord[]> {
    this.asked.push(subject);

    return this.records.get(subject) ?? [];
  }
}
