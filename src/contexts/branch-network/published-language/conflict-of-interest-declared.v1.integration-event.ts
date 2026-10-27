import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { ConflictOfInterestDeclaredV1Payload } from '@/contexts/branch-network/published-language/conflict-of-interest-declared.v1.payload';

export const conflictOfInterestDeclaredV1 = defineIntegrationEvent({
  type: 'branch-network.conflict-of-interest.declared',
  version: 1,
  description:
    "A member of staff declared a link with a customer: they never prepare nor decide that customer's applications.",
  payload: classSchema(ConflictOfInterestDeclaredV1Payload),
});

export type ConflictOfInterestDeclaredV1 = IntegrationEvent<ConflictOfInterestDeclaredV1Payload>;
