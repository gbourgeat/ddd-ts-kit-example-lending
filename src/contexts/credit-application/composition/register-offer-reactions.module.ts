import { consume, subscribeAll } from '@ddd-ts-kit/events';
import {
  rateGridPublishedV2 as rateGridDefinition,
  legalMaximumRatePublishedV2 as legalMaximumRateDefinition,
} from '@/contexts/credit-policy/published-language';
import { RateGridProjection } from '@/contexts/credit-application/offer/application/projections/rate-grid.projection';
import { LegalMaximumRateProjection } from '@/contexts/credit-application/offer/application/projections/legal-maximum-rate.projection';
import type { Platform } from '@/platform/composition/platform';

/** The reactions of the offer module: the rate grid and the legal maximum rate kept from credit-policy. */
export function registerOfferReactions(platform: Platform): void {
  const rateGridProjection = new RateGridProjection();

  subscribeAll(platform.subscriberFor('credit-application'), [
    consume(
      rateGridDefinition,
      {
        consumer: 'credit-application.rate-grid',
        processed: platform.persistence.processedEvents,
        unitOfWork: platform.persistence.unitOfWork,
        scope: platform.scope,
      },
      (event) => rateGridProjection.published(event),
    ),
  ]);

  const legalMaximumRateProjection = new LegalMaximumRateProjection();

  subscribeAll(platform.subscriberFor('credit-application'), [
    consume(
      legalMaximumRateDefinition,
      {
        consumer: 'credit-application.legal-maximum-rate',
        processed: platform.persistence.processedEvents,
        unitOfWork: platform.persistence.unitOfWork,
        scope: platform.scope,
      },
      (event) => legalMaximumRateProjection.published(event),
    ),
  ]);
}
