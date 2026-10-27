import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { ArrangementFee } from '@/contexts/credit-policy/domain/value-objects/arrangement-fee.vo';

describe('ArrangementFee', () => {
  it('keeps a whole amount of cents, zero included', () => {
    const fee = ArrangementFee.create(0);

    expect(fee.cents).toBe(0);
  });

  it('is equal to another arrangement fee of the same cents', () => {
    expect(ArrangementFee.create(4_500).equals(ArrangementFee.create(4_500))).toBe(true);
  });

  it('refuses a negative fee with the code INVALID_ARRANGEMENT_FEE', () => {
    expectRefusal(() => ArrangementFee.create(-1), 'INVALID_ARRANGEMENT_FEE');
  });

  it('refuses a fee that is not a whole number of cents with the code INVALID_ARRANGEMENT_FEE', () => {
    expectRefusal(() => ArrangementFee.create(45.5), 'INVALID_ARRANGEMENT_FEE');
  });
});
