export abstract class BorrowerNotifier {
  /** Sends a message by mail or text message to the borrower of a loan. */
  abstract notify(borrowerName: string, message: string): Promise<void>;
}
