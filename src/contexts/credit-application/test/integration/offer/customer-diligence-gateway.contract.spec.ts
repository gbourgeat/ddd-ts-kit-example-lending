import { describe, expect, it } from '@jest/globals';
import {
  CustomerDiligenceContract,
  type CreditEligibility,
} from '@/contexts/customer-due-diligence/published-language';
import type { CustomerDiligenceGateway } from '@/contexts/credit-application/offer/application/ports/customer-diligence-gateway.port';
import { InProcessCustomerDiligenceGateway } from '@/contexts/credit-application/offer/infrastructure/external/in-process-customer-diligence.gateway';
import { FakeCustomerDiligenceGateway } from '@/contexts/credit-application/test/fakes/customer-diligence-gateway.fake';

const known: CreditEligibility = { eligible: true };
const unknown: CreditEligibility = { eligible: false, reason: 'unknown-customer' };

/** An upstream that knows one customer, as customer-due-diligence would answer. */
class UpstreamKnowingOneCustomer extends CustomerDiligenceContract {
  eligibilityOf(customerId: string): Promise<CreditEligibility> {
    return Promise.resolve(customerId === 'customer-1' ? known : unknown);
  }
}

const ADAPTERS: readonly (readonly [string, () => CustomerDiligenceGateway])[] = [
  ['the fake', () => new FakeCustomerDiligenceGateway().answering('customer-1', known)],
  ['the in-process adapter', () => new InProcessCustomerDiligenceGateway(new UpstreamKnowingOneCustomer())],
];

describe.each(ADAPTERS)('CustomerDiligenceGateway, %s', (_name, create) => {
  const day = new Date('2026-02-01T00:00:00.000Z');

  it('answers that a known customer may be lent to', async () => {
    expect(await create().eligibilityOf('customer-1', day)).toEqual(known);
  });

  it('refuses, with its reason and without failing, a customer customer-due-diligence does not know', async () => {
    expect(await create().eligibilityOf('customer-unknown', day)).toEqual(unknown);
  });
});
