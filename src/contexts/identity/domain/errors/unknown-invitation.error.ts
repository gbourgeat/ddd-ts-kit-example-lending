import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { IdentityCodes } from '@/contexts/identity/identity.codes';

/** No invitation answers the token or the identifier given. The token of an invitation is never a fact of a refusal. */
export class UnknownInvitation extends DomainRefusal {
  readonly code = IdentityCodes.UnknownInvitation;

  static forReference() {
    return UnknownInvitation.refusal('No invitation answers this token or this identifier.');
  }
}
