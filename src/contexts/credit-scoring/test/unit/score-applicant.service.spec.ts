import { describe, expect, it } from '@jest/globals';
import { ScoreApplicantService } from '@/contexts/credit-scoring/domain/services/score-applicant.service';
import { Factor } from '@/contexts/credit-scoring/domain/value-objects/factor.vo';

describe('ScoreApplicantService', () => {
  it('holds no state of its own', () => {
    expect(Object.keys(new ScoreApplicantService())).toEqual([]);
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
