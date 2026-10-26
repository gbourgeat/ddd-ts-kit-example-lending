import type { Clock } from '@ddd-ts-kit/kernel';
import type { CommandHandler } from '@ddd-ts-kit/kernel';
import { UnknownAccount } from '@/contexts/identity/domain/errors/unknown-account.error';
import { UnknownInvitation } from '@/contexts/identity/domain/errors/unknown-invitation.error';
import type { AccountRepository } from '@/contexts/identity/domain/repositories/account.repository';
import type { InvitationRepository } from '@/contexts/identity/domain/repositories/invitation.repository';
import type { DeclineInvitationCommand } from '@/contexts/identity/application/commands/decline-invitation/decline-invitation.command';
import type { InvitationTokens } from '@/contexts/identity/application/ports/invitation-tokens.port';

export class DeclineInvitationHandler implements CommandHandler<DeclineInvitationCommand> {
  constructor(
    private readonly invitationRepository: InvitationRepository,
    private readonly accountRepository: AccountRepository,
    private readonly tokens: InvitationTokens,
    private readonly clock: Clock,
  ) {}

  async execute({ actor, token }: DeclineInvitationCommand): Promise<string> {
    const invitation = await this.invitationRepository.findByTokenHash(this.tokens.digestOf(token));
    const account = await this.accountRepository.findById(actor.id);

    if (invitation === undefined) {
      throw UnknownInvitation.forReference();
    }

    if (account === undefined) {
      throw UnknownAccount.forAccount(actor.id);
    }

    invitation.decline(account, this.clock.now());
    await this.invitationRepository.save(invitation);

    return invitation.id;
  }
}
