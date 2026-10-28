import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { LoanDefaultedV1Payload } from '@/contexts/servicing/published-language/loan-defaulted.v1.payload';

export const loanDefaultedV1 = defineIntegrationEvent({
  type: 'servicing.loan.defaulted',
  version: 1,
  description: 'A loan is declared in default, 90 days past due, and handed to collections.',
  payload: classSchema(LoanDefaultedV1Payload),
});

export type LoanDefaultedV1 = IntegrationEvent<LoanDefaultedV1Payload>;
