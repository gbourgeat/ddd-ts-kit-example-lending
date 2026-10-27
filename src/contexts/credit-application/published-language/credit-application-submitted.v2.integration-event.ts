import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { CreditApplicationSubmittedV2Payload } from '@/contexts/credit-application/published-language/credit-application-submitted.v2.payload';

export const creditApplicationSubmittedV2 = defineIntegrationEvent({
  type: 'credit-application.credit-application.submitted',
  version: 2,
  description: 'A credit application was submitted, for an amount and a duration, on a branch.',
  payload: classSchema(CreditApplicationSubmittedV2Payload),
});

export type CreditApplicationSubmittedV2 = IntegrationEvent<CreditApplicationSubmittedV2Payload>;
