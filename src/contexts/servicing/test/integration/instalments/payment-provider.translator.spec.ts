import { describe, expect, it } from '@jest/globals';
import { PaymentProviderTranslator } from '@/contexts/servicing/instalments/infrastructure/anti-corruption/payment-provider.translator';

describe('Translating the model of Payment provider', () => {
  it('produces a record of servicing', () => {
    expect(new PaymentProviderTranslator().translate({})).toBeDefined();
  });

  // TODO(domain): replace each entry below by a test with a real sample received from Payment provider.
  it.todo('maps every field to the vocabulary of servicing');
  it.todo('refuses a record the model of servicing cannot express');
});
