import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { ApplicantInputs } from '@/contexts/credit-scoring/domain/value-objects/applicant-inputs.vo';

describe('ApplicantInputs', () => {
  it('is equal to other applicant inputs with the same figures', () => {
    const first = ApplicantInputs.create(20, 1, 90000);
    const second = ApplicantInputs.create(20, 1, 90000);

    expect(first.equals(second)).toBe(true);
  });

  it('keeps the figures it was given', () => {
    const inputs = ApplicantInputs.create(45, 2, -1500);

    expect([inputs.debtToIncomePercent, inputs.repaymentIncidents, inputs.residualIncomeCents]).toEqual([45, 2, -1500]);
  });

  it('accepts a residual income that is negative, the costs exceeding the income', () => {
    expect(ApplicantInputs.create(20, 0, -1500).residualIncomeCents).toBe(-1500);
  });

  it('refuses a debt ratio that is not a whole number with the code INVALID_APPLICANT_INPUT', () => {
    expectRefusal(() => ApplicantInputs.create(33.5, 0, 90000), 'INVALID_APPLICANT_INPUT');
  });

  it('refuses a negative debt ratio with the code INVALID_APPLICANT_INPUT', () => {
    expectRefusal(() => ApplicantInputs.create(-1, 0, 90000), 'INVALID_APPLICANT_INPUT');
  });

  it('refuses a negative count of repayment incidents with the code INVALID_APPLICANT_INPUT', () => {
    expectRefusal(() => ApplicantInputs.create(20, -1, 90000), 'INVALID_APPLICANT_INPUT');
  });

  it('refuses a residual income that is not a whole number of cents with the code INVALID_APPLICANT_INPUT', () => {
    expectRefusal(() => ApplicantInputs.create(20, 0, 900.5), 'INVALID_APPLICANT_INPUT');
  });
});
