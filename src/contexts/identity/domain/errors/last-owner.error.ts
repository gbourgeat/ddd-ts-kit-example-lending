import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { IdentityCodes } from '@/contexts/identity/identity.codes';

export class LastOwner extends DomainRefusal {
  readonly code = IdentityCodes.LastOwner;

  static forOrganisation(organisationId: string) {
    return LastOwner.refusal(`${organisationId} keeps at least one owner.`, {
      organisationId,
    }).exposing('organisationId');
  }
}
