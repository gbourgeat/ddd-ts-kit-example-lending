import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import { UnknownCreditApplication } from '@/contexts/credit-application/file/domain/errors/unknown-credit-application.error';
import type { WithdrawLoanCommand } from '@/contexts/credit-application/offer/application/commands/withdraw-loan/withdraw-loan.command';
import type { OfferRepository } from '@/contexts/credit-application/offer/domain/repositories/offer.repository';

/** The borrower's withdrawal is recorded on the file, against the signing date of the offer of the application. */
export class WithdrawLoanHandler implements CommandHandler<WithdrawLoanCommand> {
  constructor(
    private readonly creditApplicationRepository: CreditApplicationRepository,
    private readonly dependencies: { readonly offers: OfferRepository; readonly clock: Clock },
  ) {}

  async execute(command: WithdrawLoanCommand): Promise<void> {
    const { offers, clock } = this.dependencies;
    const application = await this.creditApplicationRepository.findById(command.applicationId);

    if (application === undefined) {
      throw UnknownCreditApplication.forCreditApplication(command.applicationId);
    }

    const offer = await offers.findByApplicationId(command.applicationId);

    application.withdraw(offer?.signedAt, clock.now());

    await this.creditApplicationRepository.save(application);
  }
}
