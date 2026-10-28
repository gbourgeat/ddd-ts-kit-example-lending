import type { PersonIdentity } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';
import { IdentityDocumentExpired } from '@/contexts/customer-due-diligence/domain/errors/identity-document-expired.error';
import { ProofOfAddressTooOld } from '@/contexts/customer-due-diligence/domain/errors/proof-of-address-too-old.error';

/** A proof of address is accepted for this many months after its date. */
const PROOF_OF_ADDRESS_MAX_AGE_IN_MONTHS = 3;

export class IdentityValidityService {
  /** Refuses the identity facts of a person when the document is expired on the day, or the proof of address too old. */
  check(customerId: string, identity: PersonIdentity, now: Date): void {
    if (identity.documentExpiresOn.getTime() < now.getTime()) {
      throw IdentityDocumentExpired.forCustomer(customerId);
    }

    const oldestAcceptedProof = new Date(now.getTime());

    oldestAcceptedProof.setUTCMonth(oldestAcceptedProof.getUTCMonth() - PROOF_OF_ADDRESS_MAX_AGE_IN_MONTHS);

    if (identity.addressProofDatedOn.getTime() < oldestAcceptedProof.getTime()) {
      throw ProofOfAddressTooOld.forCustomer(customerId);
    }
  }
}
