import { PERSONAL_DATA_EXPORT_FORMAT, type PersonalDataExportDocument } from '@ddd-ts-kit/kernel';
import type { PersonalDataGathering } from '@/contexts/data-protection/application/ports/personal-data-gathering.port';

export interface GatheringRequest {
  readonly subject: string;
  readonly operator: string;
}

export class FakePersonalDataGathering implements PersonalDataGathering {
  readonly requests: GatheringRequest[] = [];

  constructor(private readonly records: PersonalDataExportDocument['records'] = []) {}

  async gather(subject: string, operator: string): Promise<PersonalDataExportDocument> {
    this.requests.push({ subject, operator });

    return {
      format: PERSONAL_DATA_EXPORT_FORMAT,
      subject,
      exportedAt: new Date('2026-10-27T00:00:00.000Z'),
      records: this.records,
    };
  }
}
