import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { LoanArrearsBucketEnteredV1Payload } from '@/contexts/servicing/published-language/loan-arrears-bucket-entered.v1.payload';

export const loanArrearsBucketEnteredV1 = defineIntegrationEvent({
  type: 'servicing.loan.arrears-bucket-entered',
  version: 1,
  description:
    'A loan enters an arrears bucket, by the days past due of its oldest unpaid instalment, so that those who report the portfolio at risk follow it.',
  payload: classSchema(LoanArrearsBucketEnteredV1Payload),
});

export type LoanArrearsBucketEnteredV1 = IntegrationEvent<LoanArrearsBucketEnteredV1Payload>;
