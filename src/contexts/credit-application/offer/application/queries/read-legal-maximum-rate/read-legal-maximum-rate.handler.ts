import type { QueryHandler } from '@ddd-ts-kit/kernel';
import type { LegalMaximumRates } from '@/contexts/credit-application/offer/application/ports/legal-maximum-rates.port';
import type { ReadLegalMaximumRateQuery } from '@/contexts/credit-application/offer/application/queries/read-legal-maximum-rate/read-legal-maximum-rate.query';
import type { ReadLegalMaximumRateResult } from '@/contexts/credit-application/offer/application/queries/read-legal-maximum-rate/read-legal-maximum-rate.result';
import { UnknownLegalMaximumRate } from '@/contexts/credit-application/offer/domain/errors/unknown-legal-maximum-rate.error';

export class ReadLegalMaximumRateHandler implements QueryHandler<ReadLegalMaximumRateQuery> {
  constructor(private readonly legalMaximumRates: LegalMaximumRates) {}

  async execute(query: ReadLegalMaximumRateQuery): Promise<ReadLegalMaximumRateResult> {
    const legalMaximumRate = await this.legalMaximumRates.get(query.legalMaximumRateId);

    if (legalMaximumRate === undefined) {
      throw UnknownLegalMaximumRate.forUnknownLegalMaximumRate();
    }

    return {
      legalMaximumRateId: legalMaximumRate.legalMaximumRateId,
      category: legalMaximumRate.category,
      rateBasisPoints: legalMaximumRate.rateBasisPoints,
      effectiveFrom: legalMaximumRate.effectiveFrom.toISOString(),
    };
  }
}
