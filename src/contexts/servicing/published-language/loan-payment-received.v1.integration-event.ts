import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { LoanPaymentReceivedV1Payload } from '@/contexts/servicing/published-language/loan-payment-received.v1.payload';

export const loanPaymentReceivedV1 = defineIntegrationEvent({
  type: 'servicing.loan.payment-received',
  version: 1,
  description:
    'The instalment of a loan is received by direct debit: its number in the schedule and the amount collected, for those who watch the repayments.',
  payload: classSchema(LoanPaymentReceivedV1Payload),
});

export type LoanPaymentReceivedV1 = IntegrationEvent<LoanPaymentReceivedV1Payload>;
