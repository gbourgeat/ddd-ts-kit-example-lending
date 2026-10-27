import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { LegalMaximumRatePublishedV1Payload } from '@/contexts/credit-policy/published-language/legal-maximum-rate-published.v1.payload';

export const legalMaximumRatePublishedV1 = defineIntegrationEvent({
  type: 'credit-policy.legal-maximum-rate.published',
  version: 1,
  description:
    'A legal maximum rate of a category of loan has been published, by its identifier, from its date of effect.',
  payload: classSchema(LegalMaximumRatePublishedV1Payload),
});

export type LegalMaximumRatePublishedV1 = IntegrationEvent<LegalMaximumRatePublishedV1Payload>;
