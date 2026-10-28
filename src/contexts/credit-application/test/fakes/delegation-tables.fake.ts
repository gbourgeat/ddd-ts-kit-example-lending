import { InMemoryReadModelStore } from '@ddd-ts-kit/kernel';
import type {
  DelegationTableRow,
  DelegationTables,
} from '@/contexts/credit-application/decision/application/ports/delegation-tables.port';
import { delegationTableCriteria } from '@/contexts/credit-application/decision/application/projections/delegation-table-criteria.projection';

/** The delegation tables read model in memory: the reference semantics of its criteria, and of the stamps. */
export class FakeDelegationTables extends InMemoryReadModelStore<DelegationTableRow> implements DelegationTables {
  constructor() {
    super(delegationTableCriteria);
  }
}
