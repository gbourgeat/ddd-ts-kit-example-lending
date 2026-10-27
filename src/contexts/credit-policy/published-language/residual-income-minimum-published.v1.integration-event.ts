import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { ResidualIncomeMinimumPublishedV1Payload } from '@/contexts/credit-policy/published-language/residual-income-minimum-published.v1.payload';

export const residualIncomeMinimumPublishedV1 = defineIntegrationEvent({
  type: 'credit-policy.residual-income-minimum.published',
  version: 1,
  description: 'A residual income minimum of the bank has been published, by its identifier.',
  payload: classSchema(ResidualIncomeMinimumPublishedV1Payload),
});

export type ResidualIncomeMinimumPublishedV1 = IntegrationEvent<ResidualIncomeMinimumPublishedV1Payload>;
