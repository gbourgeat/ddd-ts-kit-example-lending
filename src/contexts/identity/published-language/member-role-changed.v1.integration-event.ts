import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { MemberRoleChangedV1Payload } from '@/contexts/identity/published-language/member-role-changed.v1.payload';

export const memberRoleChangedV1 = defineIntegrationEvent({
  type: 'identity.member.role-changed',
  version: 1,
  description: 'The role of a member of an organisation changed.',
  payload: classSchema(MemberRoleChangedV1Payload),
});

export type MemberRoleChangedV1 = IntegrationEvent<MemberRoleChangedV1Payload>;
