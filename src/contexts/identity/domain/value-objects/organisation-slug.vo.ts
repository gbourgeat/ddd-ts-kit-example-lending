import { ValueObject } from '@ddd-ts-kit/kernel';
import { InvalidOrganisationSlug } from '@/contexts/identity/domain/errors/invalid-organisation-slug.error';

/** Lower-case letters, digits and hyphens, at most 63: a slug is also a valid tenant id and a valid alias of the identity provider. */
const SHAPE = /^[a-z0-9][a-z0-9-]{1,62}$/;

export type OrganisationSlugProps = {
  readonly value: string;
};

/** The identifier of an organisation, chosen when it opens and never changed: in addresses, in tokens, as its tenant. */
export class OrganisationSlug extends ValueObject<OrganisationSlugProps> {
  private constructor(props: OrganisationSlugProps) {
    super(props);
  }

  static create(raw: string): OrganisationSlug {
    const value = raw.trim().toLowerCase();

    if (!SHAPE.test(value)) {
      throw InvalidOrganisationSlug.forValue(raw);
    }

    return new OrganisationSlug({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
