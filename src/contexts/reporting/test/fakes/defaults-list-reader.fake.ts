import type { DefaultsListReader } from '@/contexts/reporting/application/ports/defaults-list-reader.port';
import type { DefaultsListQuery } from '@/contexts/reporting/application/queries/defaults-list/defaults-list.query';
import type { DefaultsListResult } from '@/contexts/reporting/application/queries/defaults-list/defaults-list.result';

/** The defaults list held in memory: the answer the spec gives it, whatever the query asks. */
export class FakeDefaultsListReader implements DefaultsListReader {
  constructor(private readonly answer: DefaultsListResult) {}

  async read(_query: DefaultsListQuery): Promise<DefaultsListResult> {
    return this.answer;
  }
}
