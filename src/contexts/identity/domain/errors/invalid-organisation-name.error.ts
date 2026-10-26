import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { IdentityCodes } from '@/contexts/identity/identity.codes';

export class InvalidOrganisationName extends DomainRefusal {
  readonly code = IdentityCodes.InvalidOrganisationName;

  static forValue(raw: string) {
    return InvalidOrganisationName.refusal('The name of an organisation holds between 1 and 100 characters.', { raw });
  }
}
