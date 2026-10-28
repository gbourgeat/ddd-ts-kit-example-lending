import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { CreditApplicationDecidedV1Payload } from '@/contexts/credit-application/published-language/credit-application-decided.v1.payload';

export const creditApplicationDecidedV1 = defineIntegrationEvent({
  type: 'credit-application.credit-application.decided',
  version: 1,
  description:
    'A decider approved, approved with conditions or refused a credit application: the outcome, whether it is an exception, the branch and the amount approved.',
  payload: classSchema(CreditApplicationDecidedV1Payload),
});

export type CreditApplicationDecidedV1 = IntegrationEvent<CreditApplicationDecidedV1Payload>;
