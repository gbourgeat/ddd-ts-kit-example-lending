import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { CustomerAdvisorAssignedV1Payload } from '@/contexts/customer-due-diligence/published-language/customer-advisor-assigned.v1.payload';

export const customerAdvisorAssignedV1 = defineIntegrationEvent({
  type: 'customer-due-diligence.customer.advisor-assigned',
  version: 1,
  description: 'A customer was given its advisor of the branch network, who looks after it.',
  payload: classSchema(CustomerAdvisorAssignedV1Payload),
});

export type CustomerAdvisorAssignedV1 = IntegrationEvent<CustomerAdvisorAssignedV1Payload>;
