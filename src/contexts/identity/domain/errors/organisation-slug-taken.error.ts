import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { IdentityCodes } from '@/contexts/identity/identity.codes';

export class OrganisationSlugTaken extends DomainRefusal {
  readonly code = IdentityCodes.OrganisationSlugTaken;

  static forSlug(slug: string) {
    return OrganisationSlugTaken.refusal(`An organisation is already named ${slug}.`, { slug }).exposing('slug');
  }
}
