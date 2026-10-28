import type { QueryHandler } from '@ddd-ts-kit/kernel';
import type { DefaultsListReader } from '@/contexts/reporting/application/ports/defaults-list-reader.port';
import type { DefaultsListQuery } from '@/contexts/reporting/application/queries/defaults-list/defaults-list.query';
import type { DefaultsListResult } from '@/contexts/reporting/application/queries/defaults-list/defaults-list.result';

export class DefaultsListHandler implements QueryHandler<DefaultsListQuery> {
  constructor(private readonly reader: DefaultsListReader) {}

  async execute(query: DefaultsListQuery): Promise<DefaultsListResult> {
    return this.reader.read(query);
  }
}
