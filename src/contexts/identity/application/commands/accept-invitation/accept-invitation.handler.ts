import type { Clock, IdGenerator } from '@ddd-ts-kit/kernel';
import type { CommandHandler } from '@ddd-ts-kit/kernel';
import { Member } from '@/contexts/identity/domain/aggregates/member.aggregate';
import { AlreadyMember } from '@/contexts/identity/domain/errors/already-member.error';
import { UnknownAccount } from '@/contexts/identity/domain/errors/unknown-account.error';
import { UnknownInvitation } from '@/contexts/identity/domain/errors/unknown-invitation.error';
import type { AccountRepository } from '@/contexts/identity/domain/repositories/account.repository';
import type { InvitationRepository } from '@/contexts/identity/domain/repositories/invitation.repository';
import type { MemberRepository } from '@/contexts/identity/domain/repositories/member.repository';
import type { AcceptInvitationCommand } from '@/contexts/identity/application/commands/accept-invitation/accept-invitation.command';
import type { InvitationTokens } from '@/contexts/identity/application/ports/invitation-tokens.port';

export class AcceptInvitationHandler implements CommandHandler<AcceptInvitationCommand> {
  constructor(
    private readonly invitationRepository: InvitationRepository,
    private readonly memberRepository: MemberRepository,
    private readonly accountRepository: AccountRepository,
    private readonly tokens: InvitationTokens,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  /** The person the invitation was sent to, signed in, answers with its token: they join in the role it names. */
  async execute({ actor, token }: AcceptInvitationCommand): Promise<string> {
    const invitation = await this.invitationRepository.findByTokenHash(this.tokens.digestOf(token));
    const account = await this.accountRepository.findById(actor.id);

    if (invitation === undefined) {
      throw UnknownInvitation.forReference();
    }

    if (account === undefined) {
      throw UnknownAccount.forAccount(actor.id);
    }

    account.assertActive();

    const now = this.clock.now();
    const { organisationId, role } = invitation;

    invitation.accept(account, now);

    if ((await this.memberRepository.findOf(organisationId, account.id)) !== undefined) {
      throw AlreadyMember.forMembership(organisationId, account.id);
    }

    await this.invitationRepository.save(invitation);

    await this.memberRepository.save(
      Member.join(this.ids.next(), { organisationId, accountId: account.id, role }, now),
    );

    return invitation.id;
  }
}
