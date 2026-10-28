import type { Clock, CommandHandler, FileStorage } from '@ddd-ts-kit/kernel';
import type { AccountInformationProvider } from '@/contexts/credit-application/assessment/application/ports/account-information-provider.port';
import type { ReadAccountInformationCommand } from '@/contexts/credit-application/assessment/application/commands/read-account-information/read-account-information.command';
import { MissingAccountConsent } from '@/contexts/credit-application/file/domain/errors/missing-account-consent.error';
import { UnknownCreditApplication } from '@/contexts/credit-application/file/domain/errors/unknown-credit-application.error';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';

const DOCUMENT_MEDIA_TYPE = 'application/json';

export class ReadAccountInformationHandler implements CommandHandler<ReadAccountInformationCommand> {
  constructor(
    private readonly creditApplicationRepository: CreditApplicationRepository,
    private readonly accounts: AccountInformationProvider,
    private readonly storage: FileStorage,
    private readonly clock: Clock,
  ) {}

  /** The figures are stored in the object store, then recorded in the file as a document of the application. */
  async execute(command: ReadAccountInformationCommand): Promise<string> {
    const creditApplication = await this.creditApplicationRepository.findById(command.applicationId);

    if (creditApplication === undefined) {
      throw UnknownCreditApplication.forCreditApplication(command.applicationId);
    }

    const readAt = this.clock.now();

    if (!creditApplication.hasValidAccountConsentAt(readAt)) {
      throw MissingAccountConsent.forApplication();
    }

    const figures = await this.accounts.readIncomeAndExpenses(creditApplication.id);
    const content = Buffer.from(JSON.stringify(figures), 'utf8');
    const key = `${creditApplication.id}/accounts/${readAt.toISOString().replace(/[:.]/g, '-')}.json`;

    await this.storage.put(key, this.chunksOf(content), { mediaType: DOCUMENT_MEDIA_TYPE });
    creditApplication.attachDocument({ key, mediaType: DOCUMENT_MEDIA_TYPE, sizeBytes: content.byteLength }, readAt);

    await this.creditApplicationRepository.save(creditApplication);

    return creditApplication.id;
  }

  /** The figures go to the object store as one chunk: the storage takes a stream, never a whole file in hand. */
  private async *chunksOf(content: Buffer): AsyncIterable<Uint8Array> {
    yield content;
  }
}
