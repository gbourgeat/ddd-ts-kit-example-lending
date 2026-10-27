import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { DelegationTablePublishedV2Payload } from '@/contexts/credit-policy/published-language/delegation-table-published.v2.payload';

export const delegationTablePublishedV2 = defineIntegrationEvent({
  type: 'credit-policy.delegation-table.published',
  version: 2,
  description: 'A delegation table took effect: the amount each level of decider may approve, from its date of effect.',
  payload: classSchema(DelegationTablePublishedV2Payload),
});

export type DelegationTablePublishedV2 = IntegrationEvent<DelegationTablePublishedV2Payload>;
