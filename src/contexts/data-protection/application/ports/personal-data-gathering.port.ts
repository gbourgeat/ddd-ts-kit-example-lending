import type { PersonalDataExportDocument } from '@ddd-ts-kit/kernel';

/**
 * What the contexts keep of a data subject, gathered as one document: every record of every context
 * and every tenant, read at the instant of the gathering. The operator is who asks, named in the
 * audit trail of each read.
 */
export abstract class PersonalDataGathering {
  /** Gathers the records about the subject, for the operator who asks, and answers the document. */
  abstract gather(subject: string, operator: string): Promise<PersonalDataExportDocument>;
}
