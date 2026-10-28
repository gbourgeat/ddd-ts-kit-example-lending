import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import { UnknownCreditApplication } from '@/contexts/credit-application/file/domain/errors/unknown-credit-application.error';
import type { AuthorizePayoutCommand } from '@/contexts/credit-application/offer/application/commands/authorize-payout/authorize-payout.command';
import type { CustomerDiligenceGateway } from '@/contexts/credit-application/offer/application/ports/customer-diligence-gateway.port';
import type { OfferRepository } from '@/contexts/credit-application/offer/domain/repositories/offer.repository';

/** Authorises the payout of the application on the day of the command, reading the eligibility of the customer synchronously. */
export class AuthorizePayoutHandler implements CommandHandler<AuthorizePayoutCommand> {
  constructor(
    private readonly creditApplicationRepository: CreditApplicationRepository,
    private readonly dependencies: {
      readonly offers: OfferRepository;
      readonly diligence: CustomerDiligenceGateway;
      readonly clock: Clock;
    },
  ) {}

  async execute(command: AuthorizePayoutCommand): Promise<void> {
    const { offers, diligence, clock } = this.dependencies;
    const application = await this.creditApplicationRepository.findById(command.applicationId);

    if (application === undefined) {
      throw UnknownCreditApplication.forCreditApplication(command.applicationId);
    }

    const offer = await offers.findByApplicationId(command.applicationId);
    const now = clock.now();
    const eligibility = await diligence.eligibilityOf(application.applicantId, now);

    application.authorisePayout({
      signedAt: offer?.signedAt,
      ineligibility: eligibility.eligible ? undefined : eligibility.reason,
      now,
    });

    await this.creditApplicationRepository.save(application);
  }
}
