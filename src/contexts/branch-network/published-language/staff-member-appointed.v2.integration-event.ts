import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { StaffMemberAppointedV2Payload } from '@/contexts/branch-network/published-language/staff-member-appointed.v2.payload';

export const staffMemberAppointedV2 = defineIntegrationEvent({
  type: 'branch-network.staff-member.appointed',
  version: 2,
  description: 'A member of staff was appointed to a branch, with the level of the appointment.',
  payload: classSchema(StaffMemberAppointedV2Payload),
});

export type StaffMemberAppointedV2 = IntegrationEvent<StaffMemberAppointedV2Payload>;
