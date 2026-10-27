import { describe, expect, it } from '@jest/globals';
import { RepaymentIncidentRegisterTranslator } from '@/contexts/credit-application/assessment/infrastructure/anti-corruption/repayment-incident-register.translator';

describe('Translating the model of Repayment incident register', () => {
  it('produces a record of credit-application', () => {
    expect(new RepaymentIncidentRegisterTranslator().translate({})).toBeDefined();
  });

  // TODO(domain): replace each entry below by a test with a real sample received from Repayment incident register.
  it.todo('maps every field to the vocabulary of credit-application');
  it.todo('refuses a record the model of credit-application cannot express');
});
