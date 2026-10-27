import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { RateGridPublishedV2Payload } from '@/contexts/credit-policy/published-language/rate-grid-published.v2.payload';

export const rateGridPublishedV2 = defineIntegrationEvent({
  type: 'credit-policy.rate-grid.published',
  version: 2,
  description: 'A rate grid of a product took effect, from its date of effect.',
  payload: classSchema(RateGridPublishedV2Payload),
});

export type RateGridPublishedV2 = IntegrationEvent<RateGridPublishedV2Payload>;
