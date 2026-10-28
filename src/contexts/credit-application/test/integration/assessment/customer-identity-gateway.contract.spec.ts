import { describe, expect, it } from '@jest/globals';
import type { CustomerIdentityGateway } from '@/contexts/credit-application/assessment/application/ports/customer-identity-gateway.port';
import { InProcessCustomerIdentityGateway } from '@/contexts/credit-application/assessment/infrastructure/external/in-process-customer-identity.gateway';
import { FakeCustomerIdentityGateway } from '@/contexts/credit-application/test/fakes/customer-identity-gateway.fake';

const ADAPTERS: readonly (readonly [string, () => CustomerIdentityGateway])[] = [
  ['the fake', () => new FakeCustomerIdentityGateway()],
  ['the in-process adapter', () => new InProcessCustomerIdentityGateway({ identityOf: async () => undefined })],
];

describe.each(ADAPTERS)('CustomerIdentityGateway, %s', (_name, create) => {
  it('is an adapter of the port', () => {
    expect(create()).toBeDefined();
  });

  // TODO(domain): replace each entry below by a behaviour every adapter of CustomerIdentityGateway must have, the remote one included: the same suite then holds them all.
  it.todo('answers what customer-due-diligence publishes, in the types of credit-application');
  it.todo('answers nothing, without failing, for an element customer-due-diligence does not know');
});
