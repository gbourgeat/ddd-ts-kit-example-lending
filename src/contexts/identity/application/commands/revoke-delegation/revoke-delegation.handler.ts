import type { Access } from '@ddd-ts-kit/auth';
import type { Clock } from '@ddd-ts-kit/kernel';
import type { CommandHandler } from '@ddd-ts-kit/kernel';
import { UnknownDelegation } from '@/contexts/identity/domain/errors/unknown-delegation.error';
import type { DelegationRepository } from '@/contexts/identity/domain/repositories/delegation.repository';
import type { MemberRepository } from '@/contexts/identity/domain/repositories/member.repository';
import { RoleRightsService } from '@/contexts/identity/domain/services/role-rights.service';
import { identityPermissions } from '@/contexts/identity/identity.permissions';
import type { RevokeDelegationCommand } from '@/contexts/identity/application/commands/revoke-delegation/revoke-delegation.command';

export class RevokeDelegationHandler implements CommandHandler<RevokeDelegationCommand> {
  constructor(
    private readonly delegationRepository: DelegationRepository,
    private readonly memberRepository: MemberRepository,
    private readonly access: Access,
    private readonly clock: Clock,
  ) {}

  /** Whoever may grant delegations in the organisation revokes them; one of another organisation is not found here. */
  async execute({ actor, organisationId, delegationId }: RevokeDelegationCommand): Promise<string> {
    const now = this.clock.now();
    const member = await this.memberRepository.findOf(organisationId, actor.id);
    const rights = new RoleRightsService().rightsIn(organisationId, actor.id, { member, lent: [], now });

    await this.access.authorize(actor, identityPermissions['delegation.revoke'], rights);

    const delegation = await this.delegationRepository.findById(delegationId);

    if (delegation?.organisationId !== organisationId) {
      throw UnknownDelegation.forDelegation(delegationId);
    }

    delegation.revoke(now);
    await this.delegationRepository.save(delegation);

    return delegation.id;
  }
}
