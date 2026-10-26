import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { IdentityCodes } from '@/contexts/identity/identity.codes';

export class OwnRole extends DomainRefusal {
  readonly code = IdentityCodes.OwnRole;

  static forOrganisation(organisationId: string) {
    return OwnRole.refusal(`A member of ${organisationId} does not change their own role: another member does.`, {
      organisationId,
    });
  }
}
