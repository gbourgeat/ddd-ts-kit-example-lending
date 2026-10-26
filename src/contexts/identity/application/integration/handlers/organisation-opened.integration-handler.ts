import {
  organisationOpenedV1,
  type OrganisationOpenedV1,
} from '@/contexts/identity/published-language/organisation-opened.v1.integration-event';
import type { IdentityProviderAdmin } from '@/contexts/identity/application/ports/identity-provider-admin.port';

/**
 * The provider learns the organisation under its slug, so that its tokens can name it. Driven by
 * the fact the context published through its outbox, so delivered at least once: a provider that
 * fails is asked again until it answers, and asking twice changes nothing (the adapter is idempotent).
 */
export class OrganisationOpenedIntegrationHandler {
  static readonly eventType = organisationOpenedV1.type;

  constructor(private readonly identityProvider: IdentityProviderAdmin) {}

  async handle(event: OrganisationOpenedV1): Promise<void> {
    await this.identityProvider.openOrganisation({ id: event.payload.organisationId, name: event.payload.name });
  }
}
