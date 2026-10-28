import type { Platform } from '@/platform/composition/platform';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import { ReadDocumentHandler } from '@/contexts/credit-application/file/application/queries/read-document/read-document.handler';
import { ReadDocumentQuery } from '@/contexts/credit-application/file/application/queries/read-document/read-document.query';
import { ErasePersonalDataPastRetentionCommand } from '@/contexts/credit-application/file/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';
import { ErasePersonalDataPastRetentionHandler } from '@/contexts/credit-application/file/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.handler';

/** The query that reads the document of an application, and the command that erases the personal data past retention. */
export function registerDocumentRetentionHandlers(platform: Platform, repository: CreditApplicationRepository): void {
  platform.queries.register(ReadDocumentQuery, new ReadDocumentHandler(repository, platform.files.storage), {
    context: 'credit-application',
  });

  platform.commands.register(ErasePersonalDataPastRetentionCommand, new ErasePersonalDataPastRetentionHandler(), {
    context: 'credit-application',
  });
}
