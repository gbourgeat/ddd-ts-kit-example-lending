import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { IdentityCodes } from '@/contexts/identity/identity.codes';

export class InvalidOrganisationSlug extends DomainRefusal {
  readonly code = IdentityCodes.InvalidOrganisationSlug;

  static forValue(raw: string) {
    return InvalidOrganisationSlug.refusal(
      'A slug is 2 to 63 lower-case letters, digits and hyphens, starting with a letter or a digit.',
      { raw },
    );
  }
}
