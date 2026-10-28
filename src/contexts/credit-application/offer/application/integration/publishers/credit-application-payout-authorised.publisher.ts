import type { IdGenerator, IntegrationEventPublisher } from '@ddd-ts-kit/kernel';
import type { CreditApplicationPayoutAuthorised } from '@/contexts/credit-application/offer/domain/events/credit-application-payout-authorised.event';
import { UnknownOffer } from '@/contexts/credit-application/offer/domain/errors/unknown-offer.error';
import type { OfferRepository } from '@/contexts/credit-application/offer/domain/repositories/offer.repository';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import { UnknownCreditApplication } from '@/contexts/credit-application/file/domain/errors/unknown-credit-application.error';
import { creditApplicationPayoutAuthorisedV1 } from '@/contexts/credit-application/published-language/credit-application-payout-authorised.v1.integration-event';

/** Announces the payout with the terms of the offer the borrower signed: servicing opens the loan from them. */
export class CreditApplicationPayoutAuthorisedPublisher {
  constructor(
    private readonly publisher: IntegrationEventPublisher,
    private readonly ids: IdGenerator,
    private readonly offers: OfferRepository,
    private readonly applications: CreditApplicationRepository,
  ) {}

  async handle(event: CreditApplicationPayoutAuthorised): Promise<void> {
    const offer = await this.offers.findByApplicationId(event.aggregateId);
    const creditApplication = await this.applications.findById(event.aggregateId);

    if (offer === undefined) {
      throw UnknownOffer.forOffer(event.aggregateId);
    }

    if (creditApplication === undefined) {
      throw UnknownCreditApplication.forCreditApplication(event.aggregateId);
    }

    const published = creditApplicationPayoutAuthorisedV1.create(
      {
        creditApplicationId: event.aggregateId,
        customerId: creditApplication.applicantId,
        branchId: creditApplication.branchId,
        amountCents: offer.terms.amountCents,
        durationMonths: offer.terms.durationMonths,
        rateBasisPoints: offer.terms.rateBasisPoints,
      },
      { id: this.ids.next(), occurredAt: event.occurredAt },
    );

    await this.publisher.publish([published]);
  }
}
