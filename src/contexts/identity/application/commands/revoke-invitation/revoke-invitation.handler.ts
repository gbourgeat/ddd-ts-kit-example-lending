import type { Access } from '@ddd-ts-kit/auth';
import type { Clock } from '@ddd-ts-kit/kernel';
import type { CommandHandler } from '@ddd-ts-kit/kernel';
import { UnknownInvitation } from '@/contexts/identity/domain/errors/unknown-invitation.error';
import type { DelegationRepository } from '@/contexts/identity/domain/repositories/delegation.repository';
import type { InvitationRepository } from '@/contexts/identity/domain/repositories/invitation.repository';
import type { MemberRepository } from '@/contexts/identity/domain/repositories/member.repository';
import { RoleRightsService } from '@/contexts/identity/domain/services/role-rights.service';
import { identityPermissions } from '@/contexts/identity/identity.permissions';
import type { RevokeInvitationCommand } from '@/contexts/identity/application/commands/revoke-invitation/revoke-invitation.command';

export class RevokeInvitationHandler implements CommandHandler<RevokeInvitationCommand> {
  constructor(
    private readonly invitationRepository: InvitationRepository,
    private readonly memberRepository: MemberRepository,
    private readonly delegationRepository: DelegationRepository,
    private readonly access: Access,
    private readonly clock: Clock,
  ) {}

  /** Whoever may invite in the organisation takes back its invitations: an invitation of another organisation is not found here. */
  async execute({ actor, organisationId, invitationId }: RevokeInvitationCommand): Promise<string> {
    const now = this.clock.now();
    const member = await this.memberRepository.findOf(organisationId, actor.id);
    const lent = await this.delegationRepository.findUnendedTo(organisationId, actor.id);
    const rights = new RoleRightsService().rightsIn(organisationId, actor.id, { member, lent, now });

    await this.access.authorize(actor, identityPermissions['invitation.revoke'], rights);

    const invitation = await this.invitationRepository.findById(invitationId);

    if (invitation?.organisationId !== organisationId) {
      throw UnknownInvitation.forReference();
    }

    invitation.revoke(now);
    await this.invitationRepository.save(invitation);

    return invitation.id;
  }
}
