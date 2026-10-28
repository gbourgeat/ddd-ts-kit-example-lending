import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { CreditApplicationRescheduleDecidedV1Payload } from '@/contexts/credit-application/published-language/credit-application-reschedule-decided.v1.payload';

export const creditApplicationRescheduleDecidedV1 = defineIntegrationEvent({
  type: 'credit-application.credit-application.reschedule-decided',
  version: 1,
  description:
    'A decider decided, under the delegation rules, to reschedule the loan of an approved application: its new duration and the capital it covers.',
  payload: classSchema(CreditApplicationRescheduleDecidedV1Payload),
});

export type CreditApplicationRescheduleDecidedV1 = IntegrationEvent<CreditApplicationRescheduleDecidedV1Payload>;
