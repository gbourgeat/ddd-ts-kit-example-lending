import type { Clock } from '@ddd-ts-kit/kernel';
import type { CommandHandler } from '@ddd-ts-kit/kernel';
import { Account } from '@/contexts/identity/domain/aggregates/account.aggregate';
import { EmailNotVerified } from '@/contexts/identity/domain/errors/email-not-verified.error';
import type { AccountRepository } from '@/contexts/identity/domain/repositories/account.repository';
import { DisplayName } from '@/contexts/identity/domain/value-objects/display-name.vo';
import { EmailAddress } from '@/contexts/identity/domain/value-objects/email-address.vo';
import type { ProvisionAccountCommand } from '@/contexts/identity/application/commands/provision-account/provision-account.command';

export class ProvisionAccountHandler implements CommandHandler<ProvisionAccountCommand> {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly clock: Clock,
  ) {}

  /**
   * The actor is the person the provider authenticated: their subject names the account, at the
   * first sign-in as at the next ones. The address must be one the provider verified, since the
   * invitations of the organisations are answered by whoever holds it.
   */
  async execute({ actor, profile }: ProvisionAccountCommand): Promise<string> {
    if (!profile.emailVerified) {
      throw EmailNotVerified.forAccount(actor.id);
    }

    const current = { email: EmailAddress.create(profile.email), displayName: DisplayName.create(profile.displayName) };
    const known = await this.accountRepository.findById(actor.id);

    if (known === undefined) {
      await this.accountRepository.save(Account.provision(actor.id, current, this.clock.now()));

      return actor.id;
    }

    known.refreshProfile(current);
    await this.accountRepository.save(known);

    return known.id;
  }
}
