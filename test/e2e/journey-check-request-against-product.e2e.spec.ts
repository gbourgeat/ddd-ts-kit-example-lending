import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { allowKeepingProductTerms, defineProduct } from '$test/e2e/support/credit-application/define-product';

const tenantId = 'acme-bank';

const product = {
  amountMinimumCents: 500000,
  amountMaximumCents: 3000000,
  durationMinimumMonths: 12,
  durationMaximumMonths: 84,
  arrangementFeeCents: 4500,
  insuranceMandatory: true,
  scoreThreshold: 620,
};

describe('Check request against product, end to end', () => {
  let application: RunningApplication;
  let productId: string;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();
    await allowKeepingProductTerms(application);
    await application.relate({ object: 'customer:customer-1', relation: 'self', subject: 'user:customer-1' });
    productId = await defineProduct(application, product);
  });

  it('records no finding for a request within the amount and the duration of its product', async () => {
    const applicationId = await submit({ cents: 1234567, months: 60 });

    expect(await findingsOf(applicationId)).toEqual([]);
  });

  it('records the amount above the maximum of the product, with the limit it breaks', async () => {
    const applicationId = await submit({ cents: 4000000, months: 60 });

    expect(await findingsOf(applicationId)).toEqual([
      { kind: 'outside-limit', productId, term: 'amount', bound: 'maximum', requested: 4000000, limit: 3000000 },
    ]);
  });

  it('records the duration below the minimum of the product, with the limit it breaks', async () => {
    const applicationId = await submit({ cents: 1234567, months: 6 });

    expect(await findingsOf(applicationId)).toEqual([
      { kind: 'outside-limit', productId, term: 'duration', bound: 'minimum', requested: 6, limit: 12 },
    ]);
  });

  /** Submits an application for the product as the customer, and returns its identifier once the checks have run. */
  async function submit(request: { cents: number; months: number }): Promise<string> {
    const customer = await application.as({ id: 'customer-1', tenantId });

    const response = expectStatus(
      await customer.post('/applications', {
        productId,
        amount: { cents: request.cents, currency: 'EUR' },
        durationMonths: request.months,
      }),
      201,
    );

    await application.settled();

    return (response.body as { id: string }).id;
  }

  async function findingsOf(applicationId: string): Promise<unknown[]> {
    await application.relate({ object: `application:${applicationId}`, relation: 'broker', subject: 'user:broker-1' });
    const broker = await application.as({ id: 'broker-1', tenantId });
    const answer = expectStatus(await broker.get(`/applications/${applicationId}/product-terms-findings`), 200);

    return (answer.body as { findings: unknown[] }).findings;
  }
});
