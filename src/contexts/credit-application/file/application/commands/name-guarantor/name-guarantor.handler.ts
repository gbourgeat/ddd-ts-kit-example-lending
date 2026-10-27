import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import { UnknownCreditApplication } from '@/contexts/credit-application/file/domain/errors/unknown-credit-application.error';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import type { NameGuarantorCommand } from '@/contexts/credit-application/file/application/commands/name-guarantor/name-guarantor.command';

export class NameGuarantorHandler implements CommandHandler<NameGuarantorCommand> {
  constructor(
    private readonly creditApplicationRepository: CreditApplicationRepository,
    private readonly clock: Clock,
  ) {}

  async execute(command: NameGuarantorCommand): Promise<string> {
    const creditApplication = await this.creditApplicationRepository.findById(command.applicationId);

    if (creditApplication === undefined) {
      throw UnknownCreditApplication.forCreditApplication(command.applicationId);
    }

    creditApplication.nameGuarantor(command.guarantorId, this.clock.now());

    await this.creditApplicationRepository.save(creditApplication);

    return creditApplication.id;
  }
}
