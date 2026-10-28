import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { DataProtectionCodes } from '@/contexts/data-protection/data-protection.codes';

/** A month is written YYYY-MM: the text given names no month of a year. */
export class InvalidYearMonth extends DomainRefusal {
  readonly code = DataProtectionCodes.InvalidYearMonth;

  static forText(text: string) {
    return InvalidYearMonth.refusal('A month is written YYYY-MM, a month of a year: the text given is not one.', {
      text,
    });
  }
}
