import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { LegalMaximumRatePublishedV2Payload } from '@/contexts/credit-policy/published-language/legal-maximum-rate-published.v2.payload';

export const legalMaximumRatePublishedV2 = defineIntegrationEvent({
  type: 'credit-policy.legal-maximum-rate.published',
  version: 2,
  description: 'A legal maximum rate of a category took effect: its rate in basis points, from its date of effect.',
  payload: classSchema(LegalMaximumRatePublishedV2Payload),
});

export type LegalMaximumRatePublishedV2 = IntegrationEvent<LegalMaximumRatePublishedV2Payload>;
