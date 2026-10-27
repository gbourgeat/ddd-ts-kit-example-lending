import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';
import type { IdentityDocumentKind } from '@/contexts/customer-due-diligence/domain/vocabularies/identity-document-kind.vocabulary';

/** Identifies a person new to the bank, with the identity document and the proof of address the bank checked. */
export class IdentifyCustomerCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly documentKind: IdentityDocumentKind,
    readonly documentNumber: string,
    readonly issuingCountry: string,
    readonly documentExpiresOn: Date,
    readonly address: string,
    readonly addressProofDatedOn: Date,
  ) {
    super(actor);
  }
}
