import type { DefaultedLoansReader } from '@/contexts/reporting/application/ports/defaulted-loans-reader.port';
import type { DefaultsListReader } from '@/contexts/reporting/application/ports/defaults-list-reader.port';
import type { DefaultsListQuery } from '@/contexts/reporting/application/queries/defaults-list/defaults-list.query';
import type { DefaultsListResult } from '@/contexts/reporting/application/queries/defaults-list/defaults-list.result';

/** The defaults list is the loans in default: read through the reader of the defaulted loans, from the same tables, never a second copy. */
export class DefaultsListFromDefaultedLoansReader implements DefaultsListReader {
  constructor(private readonly defaultedLoans: DefaultedLoansReader) {}

  async read(_query: DefaultsListQuery): Promise<DefaultsListResult> {
    return this.defaultedLoans.read();
  }
}
