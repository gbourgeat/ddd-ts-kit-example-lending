import {
  accountDeactivatedV1,
  type AccountDeactivatedV1,
} from '@/contexts/identity/published-language/account-deactivated.v1.integration-event';
import type { IdentityProviderAdmin } from '@/contexts/identity/application/ports/identity-provider-admin.port';

/**
 * The provider disables the person: they sign in no more. Delivered at least once through the
 * outbox, so a provider down at the time of the deactivation is asked again until it answers;
 * disabling twice changes nothing.
 */
export class AccountDeactivatedIntegrationHandler {
  static readonly eventType = accountDeactivatedV1.type;

  constructor(private readonly identityProvider: IdentityProviderAdmin) {}

  async handle(event: AccountDeactivatedV1): Promise<void> {
    await this.identityProvider.disableAccount(event.payload.accountId);
  }
}
