import { describe, expect, it } from '@jest/globals';
import type { CustomerAdvisorBranchGateway } from '@/contexts/credit-application/file/application/ports/customer-advisor-branch-gateway.port';
import { InProcessCustomerAdvisorBranchGateway } from '@/contexts/credit-application/file/infrastructure/external/in-process-customer-advisor-branch.gateway';
import { FakeCustomerAdvisorBranchGateway } from '@/contexts/credit-application/test/fakes/customer-advisor-branch-gateway.fake';

const ADAPTERS: readonly (readonly [string, () => CustomerAdvisorBranchGateway])[] = [
  ['the fake', () => new FakeCustomerAdvisorBranchGateway()],
  ['the in-process adapter', () => new InProcessCustomerAdvisorBranchGateway({})],
];

describe.each(ADAPTERS)('CustomerAdvisorBranchGateway, %s', (_name, create) => {
  it('is an adapter of the port', () => {
    expect(create()).toBeDefined();
  });

  // TODO(domain): replace each entry below by a behaviour every adapter of CustomerAdvisorBranchGateway must have, the remote one included: the same suite then holds them all.
  it.todo('answers what branch-network publishes, in the types of credit-application');
  it.todo('answers nothing, without failing, for an element branch-network does not know');
});
