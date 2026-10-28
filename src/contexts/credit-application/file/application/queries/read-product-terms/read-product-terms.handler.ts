import type { QueryHandler } from '@ddd-ts-kit/kernel';
import type { ProductTerms } from '@/contexts/credit-application/file/application/ports/product-terms.port';
import type { ReadProductTermsQuery } from '@/contexts/credit-application/file/application/queries/read-product-terms/read-product-terms.query';
import type { ReadProductTermsResult } from '@/contexts/credit-application/file/application/queries/read-product-terms/read-product-terms.result';
import { UnknownProductTerms } from '@/contexts/credit-application/file/domain/errors/unknown-product-terms.error';

export class ReadProductTermsHandler implements QueryHandler<ReadProductTermsQuery> {
  constructor(private readonly productTerms: ProductTerms) {}

  async execute(query: ReadProductTermsQuery): Promise<ReadProductTermsResult> {
    const terms = await this.productTerms.get(query.productId);

    if (terms === undefined) {
      throw UnknownProductTerms.forUnknownProductTerms();
    }

    return {
      productId: terms.productId,
      amountMinimumCents: terms.amountMinimumCents,
      amountMaximumCents: terms.amountMaximumCents,
      durationMinimumMonths: terms.durationMinimumMonths,
      durationMaximumMonths: terms.durationMaximumMonths,
      arrangementFeeCents: terms.arrangementFeeCents,
      insuranceMandatory: terms.insuranceMandatory,
    };
  }
}
