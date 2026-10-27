import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { RateGridPublishedV1Payload } from '@/contexts/credit-policy/published-language/rate-grid-published.v1.payload';

export const rateGridPublishedV1 = defineIntegrationEvent({
  type: 'credit-policy.rate-grid.published',
  version: 1,
  description: 'A rate grid of a product has been published, by its identifier.',
  payload: classSchema(RateGridPublishedV1Payload),
});

export type RateGridPublishedV1 = IntegrationEvent<RateGridPublishedV1Payload>;
