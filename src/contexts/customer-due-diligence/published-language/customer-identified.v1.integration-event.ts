import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { CustomerIdentifiedV1Payload } from '@/contexts/customer-due-diligence/published-language/customer-identified.v1.payload';

export const customerIdentifiedV1 = defineIntegrationEvent({
  type: 'customer-due-diligence.customer.identified',
  version: 1,
  description: 'A customer, a person or a business, has been identified before any credit.',
  payload: classSchema(CustomerIdentifiedV1Payload),
});

export type CustomerIdentifiedV1 = IntegrationEvent<CustomerIdentifiedV1Payload>;
