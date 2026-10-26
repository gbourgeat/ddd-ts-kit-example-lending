import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { IdentityCodes } from '@/contexts/identity/identity.codes';

export class NotAnOwner extends DomainRefusal {
  readonly code = IdentityCodes.NotAnOwner;

  static forOrganisation(organisationId: string) {
    return NotAnOwner.refusal(`Only an owner of ${organisationId} appoints or changes an owner.`, { organisationId });
  }
}
