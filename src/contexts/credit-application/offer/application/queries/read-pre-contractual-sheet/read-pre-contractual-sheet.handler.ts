import type { QueryHandler } from '@ddd-ts-kit/kernel';
import type { ReadPreContractualSheetQuery } from '@/contexts/credit-application/offer/application/queries/read-pre-contractual-sheet/read-pre-contractual-sheet.query';
import type { ReadPreContractualSheetResult } from '@/contexts/credit-application/offer/application/queries/read-pre-contractual-sheet/read-pre-contractual-sheet.result';
import { AnnualPercentageRate } from '@/contexts/credit-application/offer/domain/value-objects/annual-percentage-rate.vo';
import { UnknownOffer } from '@/contexts/credit-application/offer/domain/errors/unknown-offer.error';
import type { OfferRepository } from '@/contexts/credit-application/offer/domain/repositories/offer.repository';

export class ReadPreContractualSheetHandler implements QueryHandler<ReadPreContractualSheetQuery> {
  constructor(private readonly offerRepository: OfferRepository) {}

  async execute(query: ReadPreContractualSheetQuery): Promise<ReadPreContractualSheetResult> {
    const offer = await this.offerRepository.findById(query.offerId);

    if (offer === undefined) {
      throw UnknownOffer.forOffer(query.offerId);
    }

    const { terms } = offer;

    return {
      offerId: offer.id,
      applicationId: terms.applicationId,
      amountCents: terms.amountCents,
      durationMonths: terms.durationMonths,
      rateBasisPoints: terms.rateBasisPoints,
      annualPercentageRate: AnnualPercentageRate.ofTenths(terms.annualPercentageRateTenths).percent,
      instalmentCents: terms.instalmentCents,
      arrangementFeeCents: terms.arrangementFeeCents,
      totalToRepayCents: terms.instalmentCents * terms.durationMonths + terms.arrangementFeeCents,
    };
  }
}
