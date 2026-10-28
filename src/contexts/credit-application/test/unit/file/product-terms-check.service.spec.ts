import { describe, expect, it } from '@jest/globals';
import {
  ProductTermsCheckService,
  type ProductTermsCheckFacts,
} from '@/contexts/credit-application/file/domain/services/product-terms-check.service';
import { CreditApplicationRequestFoundOutsideProductTerms } from '@/contexts/credit-application/file/domain/events/credit-application-request-found-outside-product-terms.event';
import { CreditApplicationRequestCheckedWithUnknownProductTerms } from '@/contexts/credit-application/file/domain/events/credit-application-request-checked-with-unknown-product-terms.event';
import type { ProductLimits } from '@/contexts/credit-application/file/domain/values/product-limits';

const limits: ProductLimits = {
  amountMinimumCents: 500000,
  amountMaximumCents: 3000000,
  durationMinimumMonths: 12,
  durationMaximumMonths: 84,
};

const facts: ProductTermsCheckFacts = {
  aggregateId: 'credit-application-1',
  checkedAt: new Date('2026-01-01T00:00:00.000Z'),
  productId: 'personal-loan',
  amountCents: 1234567,
  durationMonths: 60,
};

describe('Check a request against its product', () => {
  it('keeps no finding when the amount and the duration are within the limits of the product', () => {
    expect(new ProductTermsCheckService().eventsOf(facts, limits)).toEqual([]);
  });

  it('keeps the amount above its maximum, with the limit it breaks', () => {
    const events = new ProductTermsCheckService().eventsOf({ ...facts, amountCents: 4000000 }, limits);

    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(CreditApplicationRequestFoundOutsideProductTerms);

    expect(events[0]).toMatchObject({
      finding: {
        kind: 'outside-limit',
        productId: 'personal-loan',
        term: 'amount',
        bound: 'maximum',
        requested: 4000000,
        limit: 3000000,
      },
    });
  });

  it('keeps the duration below its minimum, with the limit it breaks', () => {
    const events = new ProductTermsCheckService().eventsOf({ ...facts, durationMonths: 6 }, limits);

    expect(events).toHaveLength(1);

    expect(events[0]).toMatchObject({
      finding: { kind: 'outside-limit', term: 'duration', bound: 'minimum', requested: 6, limit: 12 },
    });
  });

  it('keeps the terms unknown when the product has no terms kept yet', () => {
    const events = new ProductTermsCheckService().eventsOf(facts, undefined);

    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(CreditApplicationRequestCheckedWithUnknownProductTerms);
    expect(events[0]).toMatchObject({ productId: 'personal-loan' });
  });
});
