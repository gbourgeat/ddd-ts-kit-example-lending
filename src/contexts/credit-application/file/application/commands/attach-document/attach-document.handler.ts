import type { Clock, CommandHandler, FileStaging } from '@ddd-ts-kit/kernel';
import { UnknownCreditApplication } from '@/contexts/credit-application/file/domain/errors/unknown-credit-application.error';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import type { AttachDocumentCommand } from '@/contexts/credit-application/file/application/commands/attach-document/attach-document.command';

export class AttachDocumentHandler implements CommandHandler<AttachDocumentCommand> {
  constructor(
    private readonly creditApplicationRepository: CreditApplicationRepository,
    private readonly clock: Clock,
    private readonly staging: FileStaging,
  ) {}

  /** The file arrives staged and scanned; it reaches its key with the commit, and stays staged, then purged, on a rollback. */
  async execute(command: AttachDocumentCommand): Promise<string> {
    const { file } = command.upload;
    const creditApplication = await this.creditApplicationRepository.findById(command.applicationId);

    if (creditApplication === undefined) {
      throw UnknownCreditApplication.forCreditApplication(command.applicationId);
    }

    creditApplication.attachDocument(
      { key: file.key, mediaType: file.mediaType, sizeBytes: file.size },
      this.clock.now(),
    );

    await this.creditApplicationRepository.save(creditApplication);
    await this.staging.promoteOnCommit(file.key);

    return creditApplication.id;
  }
}
