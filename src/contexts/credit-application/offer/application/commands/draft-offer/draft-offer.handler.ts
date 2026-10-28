import type { RelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import type { Clock, CommandHandler, IdGenerator } from '@ddd-ts-kit/kernel';
import { Money } from '@/shared-kernel/money.vo';
import type { ProductTerms } from '@/contexts/credit-application/file/application/ports/product-terms.port';
import { ApprovedTermsService } from '@/contexts/credit-application/file/domain/services/approved-terms.service';
import { UnknownCreditApplication } from '@/contexts/credit-application/file/domain/errors/unknown-credit-application.error';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import type { DraftOfferCommand } from '@/contexts/credit-application/offer/application/commands/draft-offer/draft-offer.command';
import type { OfferPricing } from '@/contexts/credit-application/offer/application/ports/offer-pricing.port';
import { Offer } from '@/contexts/credit-application/offer/domain/aggregates/offer.aggregate';
import { ApplicationNotApproved } from '@/contexts/credit-application/offer/domain/errors/application-not-approved.error';
import { NoRateForOffer } from '@/contexts/credit-application/offer/domain/errors/no-rate-for-offer.error';
import { UnknownLegalMaximumRate } from '@/contexts/credit-application/offer/domain/errors/unknown-legal-maximum-rate.error';
import type { OfferRepository } from '@/contexts/credit-application/offer/domain/repositories/offer.repository';
import { OfferTermsService } from '@/contexts/credit-application/offer/domain/services/offer-terms.service';

/** The product does not carry its category yet (owner to confirm, plan.md): every product is a personal loan. */
const LEGAL_MAXIMUM_CATEGORY = 'personal';

/**
 * Drafts the offer of an approved application: the amount and the duration are those of the approval, the rate is the
 * one of the grid in force for the product and the duration, and the draft is refused above the legal maximum in force.
 */
export class DraftOfferHandler implements CommandHandler<DraftOfferCommand> {
  constructor(
    private readonly offerRepository: OfferRepository,
    private readonly dependencies: {
      readonly applications: CreditApplicationRepository;
      readonly pricing: OfferPricing;
      readonly productTerms: ProductTerms;
      readonly ids: IdGenerator;
      readonly clock: Clock;
      readonly relations: RelationTupleStore;
    },
  ) {}

  async execute(command: DraftOfferCommand): Promise<string> {
    const { applications, productTerms, ids, clock } = this.dependencies;
    const application = await applications.findById(command.applicationId);

    if (application === undefined) {
      throw UnknownCreditApplication.forCreditApplication(command.applicationId);
    }

    const approved = new ApprovedTermsService().of(application.toState());

    if (approved === undefined) {
      throw ApplicationNotApproved.forApplication(command.applicationId);
    }

    const today = clock.now();
    const { productId, durationMonths } = approved;
    const { rate, maximum } = await this.pricingOf(approved, today);

    const terms = new OfferTermsService().termsOf({
      applicationId: command.applicationId,
      amount: approved.amount,
      durationMonths,
      rateBasisPoints: rate,
      arrangementFee: Money.ofCents((await productTerms.get(productId))?.arrangementFeeCents ?? 0),
      legalMaximumBasisPoints: maximum,
    });

    const offer = Offer.draft(ids.next(), terms, today);

    await this.offerRepository.save(offer);
    await this.linkToApplication(offer.id, command.applicationId);

    return offer.id;
  }

  /** The rate of the grid for the product and duration, and the legal maximum in force: both are needed to draft the offer. */
  private async pricingOf(
    approved: { productId: string; durationMonths: number },
    today: Date,
  ): Promise<{ rate: number; maximum: number }> {
    const { pricing } = this.dependencies;
    const rate = await pricing.rateBasisPointsFor(approved.productId, approved.durationMonths, today);
    const maximum = await pricing.legalMaximumBasisPointsFor(LEGAL_MAXIMUM_CATEGORY, today);

    if (rate === undefined) {
      throw NoRateForOffer.forProductAndDuration(approved.productId, approved.durationMonths);
    }

    if (maximum === undefined) {
      throw UnknownLegalMaximumRate.forUnknownLegalMaximumRate();
    }

    return { rate, maximum };
  }

  /** The offer belongs to its application: the applicant who consents to it may sign the offer (`offer.accept`). */
  private async linkToApplication(offerId: string, applicationId: string): Promise<void> {
    await this.dependencies.relations.write([
      { object: `offer:${offerId}`, relation: 'application', subject: `application:${applicationId}` },
    ]);
  }
}
