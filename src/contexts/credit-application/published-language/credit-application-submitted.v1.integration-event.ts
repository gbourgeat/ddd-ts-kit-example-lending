import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { CreditApplicationSubmittedV1Payload } from '@/contexts/credit-application/published-language/credit-application-submitted.v1.payload';

export const creditApplicationSubmittedV1 = defineIntegrationEvent({
  type: 'credit-application.credit-application.submitted',
  version: 1,
  description:
    'A borrower or a broker has submitted a loan request: the application file is open, with its applicant, amount in cents and duration in months.',
  payload: classSchema(CreditApplicationSubmittedV1Payload),
});

export type CreditApplicationSubmittedV1 = IntegrationEvent<CreditApplicationSubmittedV1Payload>;
