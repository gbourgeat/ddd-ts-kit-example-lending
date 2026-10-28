import { describe, expect, it } from '@jest/globals';
import type { Message, MessageType } from '@ddd-ts-kit/kernel';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { declareDecisionUseCases } from '@/contexts/credit-application/decision/application/authorization/declare-decision-use-cases.policy';
import { ReadDeclaredConflictsQuery } from '@/contexts/credit-application/decision/application/queries/read-declared-conflicts/read-declared-conflicts.query';
import { KeepDelegationTableCommand } from '@/contexts/credit-application/decision/application/commands/keep-delegation-table/keep-delegation-table.command';
import { ReadDelegationTableQuery } from '@/contexts/credit-application/decision/application/queries/read-delegation-table/read-delegation-table.query';
import { KeepDeciderLevelCommand } from '@/contexts/credit-application/decision/application/commands/keep-decider-level/keep-decider-level.command';
import { ReadDeciderLevelQuery } from '@/contexts/credit-application/decision/application/queries/read-decider-level/read-decider-level.query';
import { DecideApplicationCommand } from '@/contexts/credit-application/decision/application/commands/decide-application/decide-application.command';

const onTheContext = { type: 'context', id: 'credit-application' };

describe('The decision module use cases, as declared for authorization', () => {
  it('requires application.decide for ReadDeclaredConflictsQuery, on the context', () => {
    const declared = protectedDeclarationOf(ReadDeclaredConflictsQuery);

    expect(declared.permission).toBe(creditApplicationPermissions['application.decide']);
    expect(declared.resourceOf(instanceOf(ReadDeclaredConflictsQuery))).toEqual(onTheContext);
  });

  it('requires delegation-table.keep for KeepDelegationTableCommand, on the context', () => {
    const declared = protectedDeclarationOf(KeepDelegationTableCommand);

    expect(declared.permission).toBe(creditApplicationPermissions['delegation-table.keep']);
    expect(declared.resourceOf(instanceOf(KeepDelegationTableCommand))).toEqual(onTheContext);
  });

  it('requires application.decide for ReadDelegationTableQuery, on the context', () => {
    const declared = protectedDeclarationOf(ReadDelegationTableQuery);

    expect(declared.permission).toBe(creditApplicationPermissions['application.decide']);
    expect(declared.resourceOf(instanceOf(ReadDelegationTableQuery))).toEqual(onTheContext);
  });

  it('requires decider-level.keep for KeepDeciderLevelCommand, on the context', () => {
    const declared = protectedDeclarationOf(KeepDeciderLevelCommand);

    expect(declared.permission).toBe(creditApplicationPermissions['decider-level.keep']);
    expect(declared.resourceOf(instanceOf(KeepDeciderLevelCommand))).toEqual(onTheContext);
  });

  it('requires application.decide for ReadDeciderLevelQuery, on the context', () => {
    const declared = protectedDeclarationOf(ReadDeciderLevelQuery);

    expect(declared.permission).toBe(creditApplicationPermissions['application.decide']);
    expect(declared.resourceOf(instanceOf(ReadDeciderLevelQuery))).toEqual(onTheContext);
  });

  it('requires application.decide for DecideApplicationCommand, on the context', () => {
    const declared = protectedDeclarationOf(DecideApplicationCommand);

    expect(declared.permission).toBe(creditApplicationPermissions['application.decide']);
    expect(declared.resourceOf(instanceOf(DecideApplicationCommand))).toEqual(onTheContext);
  });
});

/** A message of the use case: the kit matches a declaration to the messages that are instances of its type. */
function instanceOf(type: MessageType<Message>): Message {
  return Object.create(type.prototype) as Message;
}

/** The protected declaration of one use case, as the policy file declares it. */
function protectedDeclarationOf(type: MessageType<Message>) {
  const declared = declareDecisionUseCases().find((entry) => entry.type === type);

  if (declared?.access !== 'protected') {
    throw new Error(`no protected declaration for ${type.name}`);
  }

  return declared;
}
