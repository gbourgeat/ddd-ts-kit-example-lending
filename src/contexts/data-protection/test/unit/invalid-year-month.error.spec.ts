import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { InvalidYearMonth } from '@/contexts/data-protection/domain/errors/invalid-year-month.error';

describe('InvalidYearMonth', () => {
  it('refuses a text that is not a month, with the code INVALID_YEAR_MONTH and the text as its fact', () => {
    const error = InvalidYearMonth.forText('2026-13');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('INVALID_YEAR_MONTH');
    expect(error.facts).toEqual({ text: '2026-13' });
  });
});
