import { CreditApplicationRequestCheckedWithUnknownProductTerms } from '@/contexts/credit-application/file/domain/events/credit-application-request-checked-with-unknown-product-terms.event';
import { CreditApplicationRequestFoundOutsideProductTerms } from '@/contexts/credit-application/file/domain/events/credit-application-request-found-outside-product-terms.event';
import { productLimitBreaches } from '@/contexts/credit-application/file/domain/values/product-limit-breaches';
import type { ProductLimits } from '@/contexts/credit-application/file/domain/values/product-limits';

/** What a check of an application against its product compares: the request, and the application it is about. */
export interface ProductTermsCheckFacts {
  readonly aggregateId: string;
  readonly checkedAt: Date;
  readonly productId: string;
  readonly amountCents: number;
  readonly durationMonths: number;
}

/** The check of a request against the limits of its product: the facts it finds, one event each. */
export class ProductTermsCheckService {
  eventsOf(
    facts: ProductTermsCheckFacts,
    limits: ProductLimits | undefined,
  ): (CreditApplicationRequestFoundOutsideProductTerms | CreditApplicationRequestCheckedWithUnknownProductTerms)[] {
    if (limits === undefined) {
      return [
        new CreditApplicationRequestCheckedWithUnknownProductTerms(facts.aggregateId, facts.checkedAt, facts.productId),
      ];
    }

    return productLimitBreaches(facts, limits).map(
      (finding) => new CreditApplicationRequestFoundOutsideProductTerms(facts.aggregateId, facts.checkedAt, finding),
    );
  }
}
