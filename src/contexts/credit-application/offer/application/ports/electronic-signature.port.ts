export abstract class ElectronicSignature {
  /** Sends an offer to its borrower to be signed electronically, by the identifier of the signer, and returns the reference of the signature request. */
  abstract requestSignature(offerId: string, signerId: string): Promise<string>;
}
