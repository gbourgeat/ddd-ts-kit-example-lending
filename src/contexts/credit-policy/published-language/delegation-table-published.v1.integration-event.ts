import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { DelegationTablePublishedV1Payload } from '@/contexts/credit-policy/published-language/delegation-table-published.v1.payload';

export const delegationTablePublishedV1 = defineIntegrationEvent({
  type: 'credit-policy.delegation-table.published',
  version: 1,
  description: 'A delegation table of the bank has been published, by its identifier.',
  payload: classSchema(DelegationTablePublishedV1Payload),
});

export type DelegationTablePublishedV1 = IntegrationEvent<DelegationTablePublishedV1Payload>;
