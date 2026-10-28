import { describe, expect, it } from '@jest/globals';
import { UnpaidInstalmentsService } from '@/contexts/servicing/arrears/domain/services/unpaid-instalments.service';

describe('UnpaidInstalmentsService', () => {
  it('holds no state of its own', () => {
    expect(Object.keys(new UnpaidInstalmentsService())).toEqual([]);
  });

  it('leaves out of the arrears the instalments paid late', () => {
    const arrears = new UnpaidInstalmentsService().unpaidOf([1, 2, 3], [2]);

    expect(arrears).toEqual([1, 3]);
  });

  it('finds two consecutive unpaid instalments in the arrears', () => {
    expect(new UnpaidInstalmentsService().hasTwoConsecutive([4, 5])).toBe(true);
  });

  it('finds no two consecutive unpaid instalments when a number is missing between them', () => {
    expect(new UnpaidInstalmentsService().hasTwoConsecutive([1, 3])).toBe(false);
  });

  it('finds no two consecutive unpaid instalments in a single unpaid instalment', () => {
    expect(new UnpaidInstalmentsService().hasTwoConsecutive([1])).toBe(false);
  });
});
