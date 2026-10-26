import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { MemberRemovedV1Payload } from '@/contexts/identity/published-language/member-removed.v1.payload';

export const memberRemovedV1 = defineIntegrationEvent({
  type: 'identity.member.removed',
  version: 1,
  description: 'A member left an organisation: what they reached there through it, they reach no more.',
  payload: classSchema(MemberRemovedV1Payload),
});

export type MemberRemovedV1 = IntegrationEvent<MemberRemovedV1Payload>;
