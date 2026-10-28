import type { DefaultedLoansReader } from '@/contexts/reporting/application/ports/defaulted-loans-reader.port';
import type { DefaultedLoansResult } from '@/contexts/reporting/application/queries/defaulted-loans/defaulted-loans.result';

/** The loans in default, answered as it was given: the reference of what the reader returns. */
export class FakeDefaultedLoansReader implements DefaultedLoansReader {
  constructor(private readonly answer: DefaultedLoansResult) {}

  async read(): Promise<DefaultedLoansResult> {
    return this.answer;
  }
}
