import type { Access } from '@ddd-ts-kit/auth';
import type { Clock, IdGenerator } from '@ddd-ts-kit/kernel';
import type { CommandHandler } from '@ddd-ts-kit/kernel';
import { Invitation } from '@/contexts/identity/domain/aggregates/invitation.aggregate';
import { Member } from '@/contexts/identity/domain/aggregates/member.aggregate';
import type { DelegationRepository } from '@/contexts/identity/domain/repositories/delegation.repository';
import type { InvitationRepository } from '@/contexts/identity/domain/repositories/invitation.repository';
import type { MemberRepository } from '@/contexts/identity/domain/repositories/member.repository';
import { RoleRightsService } from '@/contexts/identity/domain/services/role-rights.service';
import { EmailAddress } from '@/contexts/identity/domain/value-objects/email-address.vo';
import { MemberRight } from '@/contexts/identity/domain/vocabularies/member-right.vocabulary';
import { MemberRole } from '@/contexts/identity/domain/vocabularies/member-role.vocabulary';
import { identityPermissions } from '@/contexts/identity/identity.permissions';
import type { InviteMemberCommand } from '@/contexts/identity/application/commands/invite-member/invite-member.command';
import type { InvitationTokens } from '@/contexts/identity/application/ports/invitation-tokens.port';

export class InviteMemberHandler implements CommandHandler<InviteMemberCommand> {
  constructor(
    private readonly invitationRepository: InvitationRepository,
    private readonly memberRepository: MemberRepository,
    private readonly delegationRepository: DelegationRepository,
    private readonly tokens: InvitationTokens,
    private readonly access: Access,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  /**
   * Whoever may invite in the organisation invites, in their own role or below (never above it,
   * whatever a delegation lends them); the delegation used, if any, is named in the fact. The
   * token leaves in the answer, its digest stays.
   */
  async execute({ actor, organisationId, invitee }: InviteMemberCommand): Promise<{ id: string; token: string }> {
    const now = this.clock.now();
    const inviter = await this.memberRepository.findOf(organisationId, actor.id);

    const held = {
      member: inviter,
      lent: await this.delegationRepository.findUnendedTo(organisationId, actor.id),
      now,
    };

    const rights = new RoleRightsService();

    await this.access.authorize(
      actor,
      identityPermissions['member.invite'],
      rights.rightsIn(organisationId, actor.id, held),
    );

    Member.assertAppointable(organisationId, invitee.role, inviter?.role ?? MemberRole.Member);

    const { token, digest } = this.tokens.issue();
    const delegationId = rights.delegationUsedFor(MemberRight.InviteMembers, held);

    const terms = {
      organisationId,
      email: EmailAddress.create(invitee.email),
      role: invitee.role,
      tokenHash: digest,
      invitedBy: actor.id,
    };

    const invitation = Invitation.issue(
      this.ids.next(),
      { ...terms, ...(delegationId === undefined ? {} : { delegationId }) },
      now,
    );

    await this.invitationRepository.save(invitation);

    return { id: invitation.id, token };
  }
}
