import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { CreditApplicationWithdrawnV1Payload } from '@/contexts/credit-application/published-language/credit-application-withdrawn.v1.payload';

export const creditApplicationWithdrawnV1 = defineIntegrationEvent({
  type: 'credit-application.credit-application.withdrawn',
  version: 1,
  description:
    'The borrower withdrew the application within 14 calendar days of signing its offer. After a payout, servicing asks them to repay the capital and the interest accrued.',
  payload: classSchema(CreditApplicationWithdrawnV1Payload),
});

export type CreditApplicationWithdrawnV1 = IntegrationEvent<CreditApplicationWithdrawnV1Payload>;
