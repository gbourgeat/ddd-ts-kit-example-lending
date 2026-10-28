import type { DefaultsListQuery } from '@/contexts/reporting/application/queries/defaults-list/defaults-list.query';
import type { DefaultsListResult } from '@/contexts/reporting/application/queries/defaults-list/defaults-list.result';

export abstract class DefaultsListReader {
  abstract read(query: DefaultsListQuery): Promise<DefaultsListResult>;
}
