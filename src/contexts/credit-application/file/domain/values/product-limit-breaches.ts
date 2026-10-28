import type { OutsideProductLimit } from '@/contexts/credit-application/file/domain/values/product-terms-finding';
import type { ProductLimits } from '@/contexts/credit-application/file/domain/values/product-limits';

/** The limits of the product that a request breaks: its amount and its duration, each checked against its minimum and its maximum. */
export function productLimitBreaches(
  request: { readonly productId: string; readonly amountCents: number; readonly durationMonths: number },
  limits: ProductLimits,
): OutsideProductLimit[] {
  return [
    ...breachesOf(
      { productId: request.productId, term: 'amount', requested: request.amountCents },
      { minimum: limits.amountMinimumCents, maximum: limits.amountMaximumCents },
    ),
    ...breachesOf(
      { productId: request.productId, term: 'duration', requested: request.durationMonths },
      { minimum: limits.durationMinimumMonths, maximum: limits.durationMaximumMonths },
    ),
  ];
}

function breachesOf(
  check: { readonly productId: string; readonly term: 'amount' | 'duration'; readonly requested: number },
  range: { readonly minimum: number; readonly maximum: number },
): OutsideProductLimit[] {
  const breaches: OutsideProductLimit[] = [];

  if (check.requested > range.maximum) {
    breaches.push({
      kind: 'outside-limit',
      productId: check.productId,
      term: check.term,
      bound: 'maximum',
      requested: check.requested,
      limit: range.maximum,
    });
  }

  if (check.requested < range.minimum) {
    breaches.push({
      kind: 'outside-limit',
      productId: check.productId,
      term: check.term,
      bound: 'minimum',
      requested: check.requested,
      limit: range.minimum,
    });
  }

  return breaches;
}
