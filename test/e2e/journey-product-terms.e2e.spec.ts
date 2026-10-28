import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { collectEvents, expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { operatorOf } from '$test/e2e/support/credit-policy/operator-of';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';

const tenantId = 'acme-bank';
const productDefined = 'credit-policy.product.defined';

/** The system actor of credit-application that keeps the product terms: the reset of the database empties its relationships. */
const keepProductTermsSystemActor = 'system:system:credit-application.keep-product-terms';

const product = {
  amountMinimumCents: 500000,
  amountMaximumCents: 3000000,
  durationMinimumMonths: 12,
  durationMaximumMonths: 84,
  arrangementFeeCents: 4500,
  insuranceMandatory: true,
  scoreThreshold: 620,
};

describe('Keep product terms, end to end', () => {
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();

    // The reset empties the relationships of the system actors too: the keeping of the terms needs its line back.
    await application.relate({
      object: 'context:credit-application',
      relation: 'keeper',
      subject: keepProductTermsSystemActor,
    });
  });

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.get('/product-terms/personal-loan');

    expectStatus(response, 401);
  });

  it('answers 403 to a caller who does not hold application.decide', async () => {
    await defineProduct();
    const stranger = await application.as({ id: 'stranger', tenantId });

    const response = await stranger.get('/product-terms/personal-loan');

    expectStatus(response, 403);
  });

  it('answers the terms credit-policy defined for the product, to a decider', async () => {
    const productId = await defineProduct();
    const decider = await deciderOf('decider-1');

    const answer = expectStatus(await decider.get(`/product-terms/${productId}`), 200);

    expect(answer.body).toEqual({
      productId,
      amountMinimumCents: 500000,
      amountMaximumCents: 3000000,
      durationMinimumMonths: 12,
      durationMaximumMonths: 84,
      arrangementFeeCents: 4500,
      insuranceMandatory: true,
    });
  });

  it('refuses a product whose terms were never kept, with the code UNKNOWN_PRODUCT_TERMS', async () => {
    const decider = await deciderOf('decider-1');

    const response = await decider.get('/product-terms/unknown-product');

    expect(response.body).toMatchObject({ code: 'UNKNOWN_PRODUCT_TERMS' });
  });

  /** Defines the product as credit-policy's operator does, waits for its terms to be kept, and returns the identifier credit-policy gave it. */
  async function defineProduct(): Promise<string> {
    const defined = collectEvents(application.events, [productDefined]);
    const operator = await operatorOf(application, 'ada');

    expectStatus(await operator.post('/products', product), 201);
    await application.settled();
    defined.stop();

    const [event] = defined.received(productDefined);

    return (event?.payload as { productId: string }).productId;
  }

  async function deciderOf(accountId: string): Promise<HttpClient> {
    await application.relate({
      object: 'context:credit-application',
      relation: 'operator',
      subject: `user:${accountId}`,
    });

    return application.as({ id: accountId, tenantId });
  }
});
