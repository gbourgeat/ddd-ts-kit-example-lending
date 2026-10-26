import type { Clock, IdGenerator } from '@ddd-ts-kit/kernel';
import type { CommandHandler } from '@ddd-ts-kit/kernel';
import { Member } from '@/contexts/identity/domain/aggregates/member.aggregate';
import { Organisation } from '@/contexts/identity/domain/aggregates/organisation.aggregate';
import { OrganisationSlugTaken } from '@/contexts/identity/domain/errors/organisation-slug-taken.error';
import { UnknownAccount } from '@/contexts/identity/domain/errors/unknown-account.error';
import type { AccountRepository } from '@/contexts/identity/domain/repositories/account.repository';
import type { MemberRepository } from '@/contexts/identity/domain/repositories/member.repository';
import type { OrganisationRepository } from '@/contexts/identity/domain/repositories/organisation.repository';
import { OrganisationName } from '@/contexts/identity/domain/value-objects/organisation-name.vo';
import { OrganisationSlug } from '@/contexts/identity/domain/value-objects/organisation-slug.vo';
import { MemberRole } from '@/contexts/identity/domain/vocabularies/member-role.vocabulary';
import type { OpenOrganisationCommand } from '@/contexts/identity/application/commands/open-organisation/open-organisation.command';

export class OpenOrganisationHandler implements CommandHandler<OpenOrganisationCommand> {
  constructor(
    private readonly organisationRepository: OrganisationRepository,
    private readonly memberRepository: MemberRepository,
    private readonly accountRepository: AccountRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  /** The account that opens the organisation is its first owner, in the same unit of work. */
  async execute({ actor, organisation }: OpenOrganisationCommand): Promise<string> {
    const slug = OrganisationSlug.create(organisation.slug);
    const name = OrganisationName.create(organisation.name);
    const opener = await this.accountRepository.findById(actor.id);

    if (opener === undefined) {
      throw UnknownAccount.forAccount(actor.id);
    }

    opener.assertActive();

    if ((await this.organisationRepository.findById(slug.value)) !== undefined) {
      throw OrganisationSlugTaken.forSlug(slug.value);
    }

    const now = this.clock.now();
    const opened = Organisation.open(slug, { name, openedBy: opener.id }, now);

    const owner = Member.join(
      this.ids.next(),
      { organisationId: opened.id, accountId: opener.id, role: MemberRole.Owner },
      now,
    );

    await this.organisationRepository.save(opened);
    await this.memberRepository.save(owner);

    return opened.id;
  }
}
