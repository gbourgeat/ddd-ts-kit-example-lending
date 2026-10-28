import { describe, expect, it } from '@jest/globals';
import type { Message, MessageType } from '@ddd-ts-kit/kernel';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { declareOfferUseCases } from '@/contexts/credit-application/offer/application/authorization/declare-offer-use-cases.policy';
import { KeepRateGridCommand } from '@/contexts/credit-application/offer/application/commands/keep-rate-grid/keep-rate-grid.command';
import { ReadRateGridQuery } from '@/contexts/credit-application/offer/application/queries/read-rate-grid/read-rate-grid.query';
import { KeepLegalMaximumRateCommand } from '@/contexts/credit-application/offer/application/commands/keep-legal-maximum-rate/keep-legal-maximum-rate.command';
import { ReadLegalMaximumRateQuery } from '@/contexts/credit-application/offer/application/queries/read-legal-maximum-rate/read-legal-maximum-rate.query';

describe('The offer use cases, as declared for authorization', () => {
  it('requires rate-grid.keep to keep a rate grid, on the context', () => {
    const declared = declarationOf(KeepRateGridCommand);

    expect(declared.permission).toBe(creditApplicationPermissions['rate-grid.keep']);
    expect(declared.resourceOf(instanceOf(KeepRateGridCommand))).toEqual({ type: 'context', id: 'credit-application' });
  });

  it('requires decision-data.read to read a rate grid, on the context', () => {
    const declared = declarationOf(ReadRateGridQuery);

    expect(declared.permission).toBe(creditApplicationPermissions['decision-data.read']);
    expect(declared.resourceOf(instanceOf(ReadRateGridQuery))).toEqual({ type: 'context', id: 'credit-application' });
  });

  it('requires legal-maximum-rate.keep to keep a legal maximum rate, on the context', () => {
    const declared = declarationOf(KeepLegalMaximumRateCommand);

    expect(declared.permission).toBe(creditApplicationPermissions['legal-maximum-rate.keep']);

    expect(declared.resourceOf(instanceOf(KeepLegalMaximumRateCommand))).toEqual({
      type: 'context',
      id: 'credit-application',
    });
  });

  it('requires decision-data.read to read a legal maximum rate, on the context', () => {
    const declared = declarationOf(ReadLegalMaximumRateQuery);

    expect(declared.permission).toBe(creditApplicationPermissions['decision-data.read']);

    expect(declared.resourceOf(instanceOf(ReadLegalMaximumRateQuery))).toEqual({
      type: 'context',
      id: 'credit-application',
    });
  });
});

/** A message of the use case: the kit matches a declaration to the messages that are instances of its type. */
function instanceOf(type: MessageType<Message>): Message {
  return Object.create(type.prototype) as Message;
}

/** The protected declaration of one use case, as the policy file declares it. */
function declarationOf(type: MessageType<Message>) {
  const declared = declareOfferUseCases().find((entry) => entry.type === type);

  if (declared?.access !== 'protected') {
    throw new Error(`no protected declaration for ${type.name}`);
  }

  return declared;
}
