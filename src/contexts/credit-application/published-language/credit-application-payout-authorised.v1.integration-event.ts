import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { CreditApplicationPayoutAuthorisedV1Payload } from '@/contexts/credit-application/published-language/credit-application-payout-authorised.v1.payload';

export const creditApplicationPayoutAuthorisedV1 = defineIntegrationEvent({
  type: 'credit-application.credit-application.payout-authorised',
  version: 1,
  description:
    'The payout of an approved application is authorised: the 8th day after signing has come, it was not withdrawn and the customer is eligible. Servicing opens the loan.',
  payload: classSchema(CreditApplicationPayoutAuthorisedV1Payload),
});

export type CreditApplicationPayoutAuthorisedV1 = IntegrationEvent<CreditApplicationPayoutAuthorisedV1Payload>;
