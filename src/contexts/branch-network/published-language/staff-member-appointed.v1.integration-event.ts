import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { StaffMemberAppointedV1Payload } from '@/contexts/branch-network/published-language/staff-member-appointed.v1.payload';

export const staffMemberAppointedV1 = defineIntegrationEvent({
  type: 'branch-network.staff-member.appointed',
  version: 1,
  description: 'A member of staff of a bank has been appointed.',
  payload: classSchema(StaffMemberAppointedV1Payload),
});

export type StaffMemberAppointedV1 = IntegrationEvent<StaffMemberAppointedV1Payload>;
