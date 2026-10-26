import { defineIntegrationEvent } from '@ddd-ts-kit/events';
import type { IntegrationEvent } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { OrganisationOpenedV1Payload } from '@/contexts/identity/published-language/organisation-opened.v1.payload';

export const organisationOpenedV1 = defineIntegrationEvent({
  type: 'identity.organisation.opened',
  version: 1,
  description: 'An organisation was opened; with tenants, it is a new tenant.',
  payload: classSchema(OrganisationOpenedV1Payload),
});

export type OrganisationOpenedV1 = IntegrationEvent<OrganisationOpenedV1Payload>;
