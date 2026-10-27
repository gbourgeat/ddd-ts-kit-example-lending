import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import { UnknownCreditApplication } from '@/contexts/credit-application/file/domain/errors/unknown-credit-application.error';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import type { NameCoBorrowerCommand } from '@/contexts/credit-application/file/application/commands/name-co-borrower/name-co-borrower.command';

export class NameCoBorrowerHandler implements CommandHandler<NameCoBorrowerCommand> {
  constructor(
    private readonly creditApplicationRepository: CreditApplicationRepository,
    private readonly clock: Clock,
  ) {}

  async execute(command: NameCoBorrowerCommand): Promise<string> {
    const creditApplication = await this.creditApplicationRepository.findById(command.applicationId);

    if (creditApplication === undefined) {
      throw UnknownCreditApplication.forCreditApplication(command.applicationId);
    }

    creditApplication.nameCoBorrower(command.coBorrowerId, this.clock.now());

    await this.creditApplicationRepository.save(creditApplication);

    return creditApplication.id;
  }
}
