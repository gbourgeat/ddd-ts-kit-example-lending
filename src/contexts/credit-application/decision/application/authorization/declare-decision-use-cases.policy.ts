import { requires, type UseCaseDeclaration } from '@ddd-ts-kit/auth';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { ReadDeclaredConflictsQuery } from '@/contexts/credit-application/decision/application/queries/read-declared-conflicts/read-declared-conflicts.query';
import { KeepDelegationTableCommand } from '@/contexts/credit-application/decision/application/commands/keep-delegation-table/keep-delegation-table.command';
import { ReadDelegationTableQuery } from '@/contexts/credit-application/decision/application/queries/read-delegation-table/read-delegation-table.query';
import { KeepDeciderLevelCommand } from '@/contexts/credit-application/decision/application/commands/keep-decider-level/keep-decider-level.command';
import { ReadDeciderLevelQuery } from '@/contexts/credit-application/decision/application/queries/read-decider-level/read-decider-level.query';
import { DecideApplicationCommand } from '@/contexts/credit-application/decision/application/commands/decide-application/decide-application.command';

/** What the use cases of the decision module require: the declared conflicts, the delegation table and the level of each decider kept and read, and the decision itself. */
export function declareDecisionUseCases(): UseCaseDeclaration[] {
  return [
    requires(ReadDeclaredConflictsQuery, creditApplicationPermissions['application.decide'], {
      resource: () => ({ type: 'context', id: 'credit-application' }),
    }),
    requires(KeepDelegationTableCommand, creditApplicationPermissions['delegation-table.keep'], {
      resource: () => ({ type: 'context', id: 'credit-application' }),
    }),
    requires(ReadDelegationTableQuery, creditApplicationPermissions['application.decide'], {
      resource: () => ({ type: 'context', id: 'credit-application' }),
    }),
    requires(KeepDeciderLevelCommand, creditApplicationPermissions['decider-level.keep'], {
      resource: () => ({ type: 'context', id: 'credit-application' }),
    }),
    requires(ReadDeciderLevelQuery, creditApplicationPermissions['application.decide'], {
      resource: () => ({ type: 'context', id: 'credit-application' }),
    }),
    requires(DecideApplicationCommand, creditApplicationPermissions['application.decide'], {
      resource: () => ({ type: 'context', id: 'credit-application' }),
    }),
  ];
}
