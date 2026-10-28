import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { LoanPaidOutV1Payload } from '@/contexts/servicing/published-language/loan-paid-out.v1.payload';

export const loanPaidOutV1 = defineIntegrationEvent({
  type: 'servicing.loan.paid-out',
  version: 1,
  description:
    'The money of a loan is paid out to its borrower and its schedule starts: the loan exists from this moment, under the identifier of the application it was granted for.',
  payload: classSchema(LoanPaidOutV1Payload),
});

export type LoanPaidOutV1 = IntegrationEvent<LoanPaidOutV1Payload>;
