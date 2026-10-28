import { describe, expect, it } from '@jest/globals';
import type { Message, MessageType } from '@ddd-ts-kit/kernel';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { declareFileReferenceUseCases } from '@/contexts/credit-application/file/application/authorization/declare-file-reference-use-cases.policy';
import { CheckRequestAgainstProductCommand } from '@/contexts/credit-application/file/application/commands/check-request-against-product/check-request-against-product.command';
import { KeepBrokerRegistrationCommand } from '@/contexts/credit-application/file/application/commands/keep-broker-registration/keep-broker-registration.command';
import { KeepProductTermsCommand } from '@/contexts/credit-application/file/application/commands/keep-product-terms/keep-product-terms.command';
import { ReadBrokerRegistrationQuery } from '@/contexts/credit-application/file/application/queries/read-broker-registration/read-broker-registration.query';
import { ReadProductTermsFindingsQuery } from '@/contexts/credit-application/file/application/queries/read-product-terms-findings/read-product-terms-findings.query';
import { ReadProductTermsQuery } from '@/contexts/credit-application/file/application/queries/read-product-terms/read-product-terms.query';

const onTheContext = { type: 'context', id: 'credit-application' };

describe('The file module use cases on reference data, as declared for authorization', () => {
  it('requires broker-registration.keep to keep a broker registration, on the context', () => {
    const declared = protectedDeclarationOf(KeepBrokerRegistrationCommand);

    expect(declared.permission).toBe(creditApplicationPermissions['broker-registration.keep']);
    expect(declared.resourceOf(instanceOf(KeepBrokerRegistrationCommand))).toEqual(onTheContext);
  });

  it('requires application.decide to read a broker registration, on the context', () => {
    const declared = protectedDeclarationOf(ReadBrokerRegistrationQuery);

    expect(declared.permission).toBe(creditApplicationPermissions['application.decide']);
    expect(declared.resourceOf(instanceOf(ReadBrokerRegistrationQuery))).toEqual(onTheContext);
  });

  it('requires product-terms.keep to keep product terms, on the context', () => {
    const declared = protectedDeclarationOf(KeepProductTermsCommand);

    expect(declared.permission).toBe(creditApplicationPermissions['product-terms.keep']);
    expect(declared.resourceOf(instanceOf(KeepProductTermsCommand))).toEqual(onTheContext);
  });

  it('requires application.decide to read product terms, on the context', () => {
    const declared = protectedDeclarationOf(ReadProductTermsQuery);

    expect(declared.permission).toBe(creditApplicationPermissions['application.decide']);
    expect(declared.resourceOf(instanceOf(ReadProductTermsQuery))).toEqual(onTheContext);
  });

  it('requires application.read to read the findings of an application, on the application', () => {
    const declared = protectedDeclarationOf(ReadProductTermsFindingsQuery);

    expect(declared.permission).toBe(creditApplicationPermissions['application.read']);
    expect(declared.resourceOf(instanceOf(ReadProductTermsFindingsQuery))?.type).toBe('application');
  });

  it('leaves the check of a request against its product public, as the system runs it after the submission', () => {
    const declared = declareFileReferenceUseCases().find((entry) => entry.type === CheckRequestAgainstProductCommand);

    expect(declared?.access).toBe('public');
  });
});

/** A message of the use case: the kit matches a declaration to the messages that are instances of its type. */
function instanceOf(type: MessageType<Message>): Message {
  return Object.create(type.prototype) as Message;
}

/** The protected declaration of one use case, as the policy file declares it. */
function protectedDeclarationOf(type: MessageType<Message>) {
  const declared = declareFileReferenceUseCases().find((entry) => entry.type === type);

  if (declared?.access !== 'protected') {
    throw new Error(`no protected declaration for ${type.name}`);
  }

  return declared;
}
