import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { MemberJoinedV1Payload } from '@/contexts/identity/published-language/member-joined.v1.payload';

export const memberJoinedV1 = defineIntegrationEvent({
  type: 'identity.member.joined',
  version: 1,
  description: 'An account became a member of an organisation, in a role.',
  payload: classSchema(MemberJoinedV1Payload),
});

export type MemberJoinedV1 = IntegrationEvent<MemberJoinedV1Payload>;
