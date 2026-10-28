import { AuthorizedQuery } from '@ddd-ts-kit/kernel';
import type { DefaultsListResult } from '@/contexts/reporting/application/queries/defaults-list/defaults-list.result';

/** The defaults list: the list is the context itself, on no element, so the permission alone gates it. */
export class DefaultsListQuery extends AuthorizedQuery<DefaultsListResult> {}
