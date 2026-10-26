import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { IdentityCodes } from '@/contexts/identity/identity.codes';

export class UnknownOrganisation extends DomainRefusal {
  readonly code = IdentityCodes.UnknownOrganisation;

  static forOrganisation(organisationId: string) {
    return UnknownOrganisation.refusal(`No organisation ${organisationId}.`, {
      organisationId,
    }).exposing('organisationId');
  }
}
