export abstract class ElectronicSignature {
  /** Sends an offer to a borrower to be signed electronically, and returns the reference of the signature request. */
  abstract requestSignature(offerId: string, borrowerName: string): Promise<string>;
}
