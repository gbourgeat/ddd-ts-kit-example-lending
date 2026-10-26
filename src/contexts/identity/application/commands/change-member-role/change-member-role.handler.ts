import type { Access } from '@ddd-ts-kit/auth';
import type { Clock } from '@ddd-ts-kit/kernel';
import type { CommandHandler } from '@ddd-ts-kit/kernel';
import type { Member } from '@/contexts/identity/domain/aggregates/member.aggregate';
import type { Organisation } from '@/contexts/identity/domain/aggregates/organisation.aggregate';
import { UnknownMember } from '@/contexts/identity/domain/errors/unknown-member.error';
import { UnknownOrganisation } from '@/contexts/identity/domain/errors/unknown-organisation.error';
import type { DelegationRepository } from '@/contexts/identity/domain/repositories/delegation.repository';
import type { MemberRepository } from '@/contexts/identity/domain/repositories/member.repository';
import type { OrganisationRepository } from '@/contexts/identity/domain/repositories/organisation.repository';
import { RoleRightsService, type HeldRights } from '@/contexts/identity/domain/services/role-rights.service';
import { MemberRight } from '@/contexts/identity/domain/vocabularies/member-right.vocabulary';
import { MemberRole } from '@/contexts/identity/domain/vocabularies/member-role.vocabulary';
import { identityPermissions } from '@/contexts/identity/identity.permissions';
import type { ChangeMemberRoleCommand } from '@/contexts/identity/application/commands/change-member-role/change-member-role.command';

export class ChangeMemberRoleHandler implements CommandHandler<ChangeMemberRoleCommand> {
  constructor(
    private readonly organisationRepository: OrganisationRepository,
    private readonly memberRepository: MemberRepository,
    private readonly delegationRepository: DelegationRepository,
    private readonly access: Access,
    private readonly clock: Clock,
  ) {}

  /**
   * Within the role of who decides, never on their own role. The organisation is saved with the
   * change, unchanged, so that its version orders the changes of its owners: two owners who
   * demote each other at once cannot both commit and leave it without one. The delegations the
   * member gave end with the role they were granted under: what they lent may no longer be theirs.
   */
  async execute({ actor, organisationId, accountId, role }: ChangeMemberRoleCommand): Promise<string> {
    const now = this.clock.now();
    const held = await this.heldBy(organisationId, actor.id, now);
    const rights = new RoleRightsService();

    await this.access.authorize(
      actor,
      identityPermissions['member.change-role'],
      rights.rightsIn(organisationId, actor.id, held),
    );

    const { organisation, member } = await this.membershipIn(organisationId, accountId);
    const delegationId = rights.delegationUsedFor(MemberRight.ManageMembers, held);
    const owners = await this.memberRepository.countOwners(organisationId);

    member.changeRole(
      role,
      { by: held.member?.role ?? MemberRole.Member, byAccount: actor.id, delegationId, owners },
      now,
    );

    await this.organisationRepository.save(organisation);
    await this.memberRepository.save(member);
    await this.endDelegationsGivenBy(organisationId, accountId, now);

    return member.id;
  }

  private async heldBy(organisationId: string, accountId: string, now: Date): Promise<HeldRights> {
    const member = await this.memberRepository.findOf(organisationId, accountId);

    return { member, lent: await this.delegationRepository.findUnendedTo(organisationId, accountId), now };
  }

  /** The organisation, to be saved with the change, and the membership the change is about. */
  private async membershipIn(
    organisationId: string,
    accountId: string,
  ): Promise<{ organisation: Organisation; member: Member }> {
    const organisation = await this.organisationRepository.findById(organisationId);
    const member = await this.memberRepository.findOf(organisationId, accountId);

    if (organisation === undefined) {
      throw UnknownOrganisation.forOrganisation(organisationId);
    }

    if (member === undefined) {
      throw UnknownMember.forMembership(organisationId, accountId);
    }

    return { organisation, member };
  }

  private async endDelegationsGivenBy(organisationId: string, accountId: string, now: Date): Promise<void> {
    const involving = await this.delegationRepository.findUnendedInvolving(organisationId, accountId);

    for (const delegation of involving.filter((given) => given.delegatorId === accountId)) {
      delegation.end(now);
      await this.delegationRepository.save(delegation);
    }
  }
}
