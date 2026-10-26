import type { Access } from '@ddd-ts-kit/auth';
import type { Clock } from '@ddd-ts-kit/kernel';
import type { QueryHandler } from '@ddd-ts-kit/kernel';
import type { DelegationRepository } from '@/contexts/identity/domain/repositories/delegation.repository';
import type { MemberRepository } from '@/contexts/identity/domain/repositories/member.repository';
import { RoleRightsService } from '@/contexts/identity/domain/services/role-rights.service';
import { identityPermissions } from '@/contexts/identity/identity.permissions';
import type { SearchMembersReader } from '@/contexts/identity/application/ports/search-members-reader.port';
import type { SearchMembersQuery } from '@/contexts/identity/application/queries/search-members/search-members.query';
import type { SearchMembersResult } from '@/contexts/identity/application/queries/search-members/search-members.result';

export class SearchMembersHandler implements QueryHandler<SearchMembersQuery> {
  constructor(
    private readonly reader: SearchMembersReader,
    private readonly memberRepository: MemberRepository,
    private readonly delegationRepository: DelegationRepository,
    private readonly access: Access,
    private readonly clock: Clock,
  ) {}

  /** The members of an organisation are read by its members, and by nobody else: the read names the organisation the right was decided on. */
  async execute({ actor, organisationId, page }: SearchMembersQuery): Promise<SearchMembersResult> {
    const now = this.clock.now();
    const member = await this.memberRepository.findOf(organisationId, actor.id);
    const lent = await this.delegationRepository.findUnendedTo(organisationId, actor.id);
    const rights = new RoleRightsService().rightsIn(organisationId, actor.id, { member, lent, now });

    await this.access.authorize(actor, identityPermissions['member.search'], rights);

    return this.reader.search(organisationId, page);
  }
}
