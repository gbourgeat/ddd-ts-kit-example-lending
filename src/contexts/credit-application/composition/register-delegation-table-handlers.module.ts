import type { Platform } from '@/platform/composition/platform';
import type { DelegationTables } from '@/contexts/credit-application/decision/application/ports/delegation-tables.port';
import { KeepDelegationTableCommand } from '@/contexts/credit-application/decision/application/commands/keep-delegation-table/keep-delegation-table.command';
import { KeepDelegationTableHandler } from '@/contexts/credit-application/decision/application/commands/keep-delegation-table/keep-delegation-table.handler';
import { ReadDelegationTableQuery } from '@/contexts/credit-application/decision/application/queries/read-delegation-table/read-delegation-table.query';
import { ReadDelegationTableHandler } from '@/contexts/credit-application/decision/application/queries/read-delegation-table/read-delegation-table.handler';

/** The command that keeps the delegation tables and the query that reads them, over the read model the module binds. */
export function registerDelegationTableHandlers(platform: Platform, delegationTables: DelegationTables): void {
  platform.commands.register(KeepDelegationTableCommand, new KeepDelegationTableHandler(delegationTables), {
    context: 'credit-application',
  });

  platform.queries.register(ReadDelegationTableQuery, new ReadDelegationTableHandler(delegationTables), {
    context: 'credit-application',
  });
}
