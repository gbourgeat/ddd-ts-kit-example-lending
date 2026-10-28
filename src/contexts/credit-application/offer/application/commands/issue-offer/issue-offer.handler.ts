import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import type { IssueOfferCommand } from '@/contexts/credit-application/offer/application/commands/issue-offer/issue-offer.command';
import type { OfferPricing } from '@/contexts/credit-application/offer/application/ports/offer-pricing.port';
import { UnknownLegalMaximumRate } from '@/contexts/credit-application/offer/domain/errors/unknown-legal-maximum-rate.error';
import { UnknownOffer } from '@/contexts/credit-application/offer/domain/errors/unknown-offer.error';
import type { OfferRepository } from '@/contexts/credit-application/offer/domain/repositories/offer.repository';

/** The product does not carry its category yet (owner to confirm, plan.md): every product is a personal loan. */
const LEGAL_MAXIMUM_CATEGORY = 'personal';

/**
 * Issues the offer drafted for an application, on the day of the command: refused when its annual percentage rate is at
 * or above the legal maximum rate in force that day.
 */
export class IssueOfferHandler implements CommandHandler<IssueOfferCommand> {
  constructor(
    private readonly offerRepository: OfferRepository,
    private readonly dependencies: {
      readonly pricing: OfferPricing;
      readonly clock: Clock;
    },
  ) {}

  async execute(command: IssueOfferCommand): Promise<void> {
    const { pricing, clock } = this.dependencies;
    const offer = await this.offerRepository.findByApplicationId(command.applicationId);

    if (offer === undefined) {
      throw UnknownOffer.forOffer(command.applicationId);
    }

    const today = clock.now();
    const maximum = await pricing.legalMaximumBasisPointsFor(LEGAL_MAXIMUM_CATEGORY, today);

    if (maximum === undefined) {
      throw UnknownLegalMaximumRate.forUnknownLegalMaximumRate();
    }

    offer.issue(today, maximum);

    await this.offerRepository.save(offer);
  }
}
