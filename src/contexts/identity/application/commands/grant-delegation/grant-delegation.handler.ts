import type { Access } from '@ddd-ts-kit/auth';
import type { Clock, IdGenerator } from '@ddd-ts-kit/kernel';
import type { CommandHandler } from '@ddd-ts-kit/kernel';
import { Delegation } from '@/contexts/identity/domain/aggregates/delegation.aggregate';
import { UnknownMember } from '@/contexts/identity/domain/errors/unknown-member.error';
import type { DelegationRepository } from '@/contexts/identity/domain/repositories/delegation.repository';
import type { MemberRepository } from '@/contexts/identity/domain/repositories/member.repository';
import { RoleRightsService } from '@/contexts/identity/domain/services/role-rights.service';
import { DelegationPeriod } from '@/contexts/identity/domain/value-objects/delegation-period.vo';
import { identityPermissions } from '@/contexts/identity/identity.permissions';
import type { GrantDelegationCommand } from '@/contexts/identity/application/commands/grant-delegation/grant-delegation.command';

export class GrantDelegationHandler implements CommandHandler<GrantDelegationCommand> {
  constructor(
    private readonly delegationRepository: DelegationRepository,
    private readonly memberRepository: MemberRepository,
    private readonly access: Access,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  /** A member lends what their role grants, never what was lent to them, to another member of the organisation. */
  async execute({ actor, organisationId, terms }: GrantDelegationCommand): Promise<string> {
    const now = this.clock.now();
    const delegator = await this.memberRepository.findOf(organisationId, actor.id);
    const held = new RoleRightsService().rightsIn(organisationId, actor.id, { member: delegator, lent: [], now });

    await this.access.authorize(actor, identityPermissions['delegation.grant'], held);

    if ((await this.memberRepository.findOf(organisationId, terms.delegateId)) === undefined) {
      throw UnknownMember.forMembership(organisationId, terms.delegateId);
    }

    const period = DelegationPeriod.create(terms.startsAt, terms.endsAt);
    const lent = { organisationId, delegatorId: actor.id, delegateId: terms.delegateId, rights: terms.rights, period };
    const delegation = Delegation.grant(this.ids.next(), { ...lent, held }, now);

    await this.delegationRepository.save(delegation);

    return delegation.id;
  }
}
