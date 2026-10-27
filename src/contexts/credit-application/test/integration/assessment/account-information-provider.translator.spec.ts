import { describe, expect, it } from '@jest/globals';
import { AccountInformationProviderTranslator } from '@/contexts/credit-application/assessment/infrastructure/anti-corruption/account-information-provider.translator';

describe('Translating the model of Account information provider', () => {
  it('produces a record of credit-application', () => {
    expect(new AccountInformationProviderTranslator().translate({})).toBeDefined();
  });

  // TODO(domain): replace each entry below by a test with a real sample received from Account information provider.
  it.todo('maps every field to the vocabulary of credit-application');
  it.todo('refuses a record the model of credit-application cannot express');
});
