import { consume, subscribeAll } from '@ddd-ts-kit/events';
import { productDefinedV2 as productTermsDefinition } from '@/contexts/credit-policy/published-language';
import { ProductTermsProjection } from '@/contexts/credit-application/file/application/projections/product-terms.projection';
import type { Platform } from '@/platform/composition/platform';

/** The reactions of the file module: the terms of each product kept from credit-policy. */
export function registerFileReactions(platform: Platform): void {
  const productTermsProjection = new ProductTermsProjection();

  subscribeAll(platform.subscriberFor('credit-application'), [
    consume(
      productTermsDefinition,
      {
        consumer: 'credit-application.product-terms',
        processed: platform.persistence.processedEvents,
        unitOfWork: platform.persistence.unitOfWork,
        scope: platform.scope,
      },
      (event) => productTermsProjection.defined(event),
    ),
  ]);
}
