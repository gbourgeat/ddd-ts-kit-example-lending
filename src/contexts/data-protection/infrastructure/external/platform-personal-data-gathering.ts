import type { PersonalDataExportDocument } from '@ddd-ts-kit/kernel';
import type { PersonalDataGathering } from '@/contexts/data-protection/application/ports/personal-data-gathering.port';

/**
 * The gathering of the platform, run in process: the export of every copy the contexts declared, in
 * every tenant the directory lists, read as the operator who asks. The module gives the function that
 * runs it, so the context does not reach into the composition of the platform.
 */
export class PlatformPersonalDataGathering implements PersonalDataGathering {
  constructor(private readonly exportOf: (subject: string, operator: string) => Promise<PersonalDataExportDocument>) {}

  gather(subject: string, operator: string): Promise<PersonalDataExportDocument> {
    return this.exportOf(subject, operator);
  }
}
