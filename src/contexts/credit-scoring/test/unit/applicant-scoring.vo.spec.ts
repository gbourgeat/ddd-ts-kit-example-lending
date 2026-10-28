import { describe, expect, it } from '@jest/globals';
import { ApplicantScoring } from '@/contexts/credit-scoring/domain/value-objects/applicant-scoring.vo';
import { Factor } from '@/contexts/credit-scoring/domain/value-objects/factor.vo';
import { Score } from '@/contexts/credit-scoring/domain/value-objects/score.vo';
import { Band } from '@/contexts/credit-scoring/domain/vocabularies/band.vocabulary';

describe('ApplicantScoring', () => {
  it('is equal to another applicant scoring with the same score and factors', () => {
    const factors = [Factor.create('A repayment incident is registered in your name', 25)];

    const first = ApplicantScoring.create(Score.create(75), factors);
    const second = ApplicantScoring.create(Score.create(75), factors);

    expect(first.equals(second)).toBe(true);
  });

  it('takes its band from its score', () => {
    expect(ApplicantScoring.create(Score.create(70), []).band()).toBe(Band.Green);
  });

  it('keeps the factors it was given, in the order given', () => {
    const factors = [Factor.create('Your debts take a large share of your income', 30)];

    const scoring = ApplicantScoring.create(Score.create(70), factors);

    expect(scoring.factors.map((factor) => factor.words)).toEqual(['Your debts take a large share of your income']);
  });
});
