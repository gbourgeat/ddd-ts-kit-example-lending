import { describe, expect, it } from '@jest/globals';
import { ApplicantFactorsService } from '@/contexts/credit-scoring/domain/services/applicant-factors.service';
import { ApplicantInputs } from '@/contexts/credit-scoring/domain/value-objects/applicant-inputs.vo';

const CLEAN_DEBT_PERCENT = 20;
const CLEAN_INCIDENTS = 0;
const CLEAN_RESIDUAL_INCOME_CENTS = 120000;

describe('ApplicantFactorsService', () => {
  it('holds no state of its own', () => {
    expect(Object.keys(new ApplicantFactorsService())).toEqual([]);
  });

  it('names no factor for an applicant whose debts, incidents and residual income are all sound', () => {
    const inputs = applicantWith(CLEAN_DEBT_PERCENT, CLEAN_INCIDENTS, CLEAN_RESIDUAL_INCOME_CENTS);

    expect(new ApplicantFactorsService().loweringFactorsOf(inputs)).toEqual([]);
  });

  it('names a large share of income with a harm of 30 when the debt ratio is above 40 percent', () => {
    const factors = new ApplicantFactorsService().loweringFactorsOf(applicantWith(41, 0, CLEAN_RESIDUAL_INCOME_CENTS));

    expect(factors.map(describeFactor)).toEqual([['Your debts take a large share of your income', 30]]);
  });

  it('names the debt close to the limit with a harm of 15 when the debt ratio is 40 percent', () => {
    const factors = new ApplicantFactorsService().loweringFactorsOf(applicantWith(40, 0, CLEAN_RESIDUAL_INCOME_CENTS));

    expect(factors.map(describeFactor)).toEqual([
      ['Your debts take a share of your income that is close to the limit', 15],
    ]);
  });

  it('names no debt factor when the debt ratio is 33 percent', () => {
    const factors = new ApplicantFactorsService().loweringFactorsOf(applicantWith(33, 0, CLEAN_RESIDUAL_INCOME_CENTS));

    expect(factors).toEqual([]);
  });

  it('names one repayment incident factor with a harm of 25 for each registered incident', () => {
    const factors = new ApplicantFactorsService().loweringFactorsOf(applicantWith(20, 2, CLEAN_RESIDUAL_INCOME_CENTS));

    expect(factors.map(describeFactor)).toEqual([
      ['A repayment incident is registered in your name', 25],
      ['A repayment incident is registered in your name', 25],
    ]);
  });

  it('names a low residual income with a harm of 20 when it is under 80000 cents', () => {
    const factors = new ApplicantFactorsService().loweringFactorsOf(applicantWith(20, 0, 79999));

    expect(factors.map(describeFactor)).toEqual([['The income left after your costs is low', 20]]);
  });

  it('names no residual income factor when it is exactly 80000 cents', () => {
    const factors = new ApplicantFactorsService().loweringFactorsOf(applicantWith(20, 0, 80000));

    expect(factors).toEqual([]);
  });
});

function applicantWith(debtToIncomePercent: number, repaymentIncidents: number, residualIncomeCents: number) {
  return ApplicantInputs.create(debtToIncomePercent, repaymentIncidents, residualIncomeCents);
}

function describeFactor(factor: { readonly words: string; readonly harm: number }): [string, number] {
  return [factor.words, factor.harm];
}
