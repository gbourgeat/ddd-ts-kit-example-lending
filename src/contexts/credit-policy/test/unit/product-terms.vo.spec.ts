import { describe, expect, it } from '@jest/globals';
import { ProductTerms } from '@/contexts/credit-policy/domain/value-objects/product-terms.vo';
import { AmountBounds } from '@/contexts/credit-policy/domain/value-objects/amount-bounds.vo';
import { ArrangementFee } from '@/contexts/credit-policy/domain/value-objects/arrangement-fee.vo';
import { DurationBounds } from '@/contexts/credit-policy/domain/value-objects/duration-bounds.vo';
import { ScoreThreshold } from '@/contexts/credit-policy/domain/value-objects/score-threshold.vo';

describe('ProductTerms', () => {
  it('keeps each term it was defined with', () => {
    const terms = termsWith(true);

    expect(terms.insuranceMandatory).toBe(true);
    expect(terms.scoreThreshold.score).toBe(600);
    expect(terms.arrangementFee.cents).toBe(4_500);
    expect(terms.amount.maximumCents).toBe(2_500_000);
    expect(terms.duration.maximumMonths).toBe(84);
  });

  it('is equal to terms with the same amounts, durations, fee, insurance and threshold', () => {
    expect(termsWith(false).equals(termsWith(false))).toBe(true);
  });
});

function termsWith(insuranceMandatory: boolean): ProductTerms {
  return ProductTerms.create({
    amount: AmountBounds.create(100_000, 2_500_000),
    duration: DurationBounds.create(12, 84),
    arrangementFee: ArrangementFee.create(4_500),
    insuranceMandatory,
    scoreThreshold: ScoreThreshold.create(600),
  });
}
