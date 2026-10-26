import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { DelegationGrantedV1Payload } from '@/contexts/identity/published-language/delegation-granted.v1.payload';

export const delegationGrantedV1 = defineIntegrationEvent({
  type: 'identity.delegation.granted',
  version: 1,
  description: 'A member lent rights to another member of the organisation, from an instant to another.',
  payload: classSchema(DelegationGrantedV1Payload),
});

export type DelegationGrantedV1 = IntegrationEvent<DelegationGrantedV1Payload>;
