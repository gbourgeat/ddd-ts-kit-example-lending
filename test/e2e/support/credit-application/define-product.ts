import { collectEvents, expectStatus } from '@ddd-ts-kit/testing/e2e';
import { operatorOf } from '$test/e2e/support/credit-policy/operator-of';
import type { RunningApplication } from '$test/e2e/support/start-application';

/** The integration event by which credit-policy announces a defined product. */
export const productDefinedEvent = 'credit-policy.product.defined';

/** The system actor of credit-application that keeps the product terms: the reset of the database empties its relationships. */
export const keepProductTermsSystemActor = 'system:system:credit-application.keep-product-terms';

/** Gives the system actor that keeps the product terms its relationship back, after a reset of the database. */
export async function allowKeepingProductTerms(application: RunningApplication): Promise<void> {
  await application.relate({
    object: 'context:credit-application',
    relation: 'keeper',
    subject: keepProductTermsSystemActor,
  });
}

/** Defines the product as credit-policy's operator does, waits for its terms to be kept, and returns the identifier credit-policy gave it. */
export async function defineProduct(application: RunningApplication, product: object): Promise<string> {
  const defined = collectEvents(application.events, [productDefinedEvent]);
  const operator = await operatorOf(application, 'ada');

  expectStatus(await operator.post('/products', product), 201);
  await application.settled();
  defined.stop();

  const [event] = defined.received(productDefinedEvent);

  return (event?.payload as { productId: string }).productId;
}
