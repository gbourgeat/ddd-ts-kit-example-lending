import { describe, expect, it } from '@jest/globals';
import { ScoreApplicantService } from '@/contexts/credit-scoring/domain/services/score-applicant.service';
import { ApplicantInputs } from '@/contexts/credit-scoring/domain/value-objects/applicant-inputs.vo';
import { Factor } from '@/contexts/credit-scoring/domain/value-objects/factor.vo';
import { Band } from '@/contexts/credit-scoring/domain/vocabularies/band.vocabulary';

const SOUND_RESIDUAL_INCOME_CENTS = 120000;
const LOW_RESIDUAL_INCOME_CENTS = 70000;

describe('ScoreApplicantService', () => {
  it('holds no state of its own', () => {
    expect(Object.keys(new ScoreApplicantService())).toEqual([]);
  });

  it('scores an applicant with no lowering fact at 100, in the green band, with no factor', () => {
    const scoring = new ScoreApplicantService().score(ApplicantInputs.create(20, 0, SOUND_RESIDUAL_INCOME_CENTS));

    expect(scoring.score.value).toBe(100);
    expect(scoring.band()).toBe(Band.Green);
    expect(scoring.factors).toEqual([]);
  });

  it('takes the harm of a large share of income off the score of an applicant above 40 percent of debt', () => {
    const scoring = new ScoreApplicantService().score(ApplicantInputs.create(45, 0, SOUND_RESIDUAL_INCOME_CENTS));

    expect(scoring.score.value).toBe(70);
    expect(scoring.factors.map((factor) => factor.words)).toEqual(['Your debts take a large share of your income']);
  });

  it('takes the harm of a debt close to the limit off the score at exactly 40 percent of debt', () => {
    const scoring = new ScoreApplicantService().score(ApplicantInputs.create(40, 0, SOUND_RESIDUAL_INCOME_CENTS));

    expect(scoring.score.value).toBe(85);

    expect(scoring.factors.map((factor) => factor.words)).toEqual([
      'Your debts take a share of your income that is close to the limit',
    ]);
  });

  it('takes the harm of each repayment incident off the score, one factor per incident', () => {
    const scoring = new ScoreApplicantService().score(ApplicantInputs.create(20, 2, SOUND_RESIDUAL_INCOME_CENTS));

    expect(scoring.score.value).toBe(50);

    expect(scoring.factors.map((factor) => factor.words)).toEqual([
      'A repayment incident is registered in your name',
      'A repayment incident is registered in your name',
    ]);
  });

  it('takes the harm of a low residual income off the score under 80000 cents', () => {
    const scoring = new ScoreApplicantService().score(ApplicantInputs.create(20, 0, 79999));

    expect(scoring.score.value).toBe(80);
    expect(scoring.factors.map((factor) => factor.words)).toEqual(['The income left after your costs is low']);
  });

  it('caps the score at 0 when the harms of the lowering facts exceed 100', () => {
    const scoring = new ScoreApplicantService().score(ApplicantInputs.create(45, 3, SOUND_RESIDUAL_INCOME_CENTS));

    expect(scoring.score.value).toBe(0);
  });

  it('puts a score of 70 in the green band, the edge of the band', () => {
    const scoring = new ScoreApplicantService().score(ApplicantInputs.create(45, 0, SOUND_RESIDUAL_INCOME_CENTS));

    expect(scoring.band()).toBe(Band.Green);
  });

  it('puts a score of 65 in the amber band, just under the green edge', () => {
    const scoring = new ScoreApplicantService().score(ApplicantInputs.create(38, 0, LOW_RESIDUAL_INCOME_CENTS));

    expect(scoring.score.value).toBe(65);
    expect(scoring.band()).toBe(Band.Amber);
  });

  it('puts a score of 40 in the amber band, the edge of the band', () => {
    const scoring = new ScoreApplicantService().score(ApplicantInputs.create(38, 1, LOW_RESIDUAL_INCOME_CENTS));

    expect(scoring.score.value).toBe(40);
    expect(scoring.band()).toBe(Band.Amber);
  });

  it('puts a score of 35 in the red band, just under the amber edge', () => {
    const scoring = new ScoreApplicantService().score(ApplicantInputs.create(38, 2, SOUND_RESIDUAL_INCOME_CENTS));

    expect(scoring.score.value).toBe(35);
    expect(scoring.band()).toBe(Band.Red);
  });

  it('lists only the five most harmful factors of an applicant with six lowering facts', () => {
    const scoring = new ScoreApplicantService().score(ApplicantInputs.create(45, 4, 0));

    expect(scoring.factors.map((factor) => factor.harm)).toEqual([30, 25, 25, 25, 25]);
  });

  it('lists the factors that lowered the score most harmful first', () => {
    const factors = [factorOf('Short employment', 5), factorOf('Late payments', 20), factorOf('High debt ratio', 10)];

    const listed = new ScoreApplicantService().mainFactors(factors);

    expect(listed.map((factor) => factor.words)).toEqual(['Late payments', 'High debt ratio', 'Short employment']);
  });

  it('lists at most five factors, leaving out the least harmful', () => {
    const factors = [
      factorOf('Factor one', 1),
      factorOf('Factor two', 2),
      factorOf('Factor three', 3),
      factorOf('Factor four', 4),
      factorOf('Factor five', 5),
      factorOf('Factor six', 6),
    ];

    const listed = new ScoreApplicantService().mainFactors(factors);

    expect(listed.map((factor) => factor.words)).toEqual([
      'Factor six',
      'Factor five',
      'Factor four',
      'Factor three',
      'Factor two',
    ]);
  });

  it('lists no factor when none lowered the score', () => {
    expect(new ScoreApplicantService().mainFactors([])).toEqual([]);
  });
});

function factorOf(words: string, harm: number): Factor {
  return Factor.create(words, harm);
}
