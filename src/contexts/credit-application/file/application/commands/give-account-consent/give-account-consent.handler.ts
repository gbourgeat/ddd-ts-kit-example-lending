import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import { UnknownCreditApplication } from '@/contexts/credit-application/file/domain/errors/unknown-credit-application.error';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import type { GiveAccountConsentCommand } from '@/contexts/credit-application/file/application/commands/give-account-consent/give-account-consent.command';

export class GiveAccountConsentHandler implements CommandHandler<GiveAccountConsentCommand> {
  constructor(
    private readonly creditApplicationRepository: CreditApplicationRepository,
    private readonly clock: Clock,
  ) {}

  async execute(command: GiveAccountConsentCommand): Promise<string> {
    const creditApplication = await this.creditApplicationRepository.findById(command.applicationId);

    if (creditApplication === undefined) {
      throw UnknownCreditApplication.forCreditApplication(command.applicationId);
    }

    creditApplication.giveAccountConsent(this.clock.now());

    await this.creditApplicationRepository.save(creditApplication);

    return creditApplication.id;
  }
}
