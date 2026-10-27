import type { BorrowerNotifier } from '@/contexts/servicing/arrears/application/ports/borrower-notifier.port';

export class SimulatedBorrowerNotifier implements BorrowerNotifier {
  private readonly sent: { readonly borrowerName: string; readonly message: string }[] = [];

  async notify(borrowerName: string, message: string): Promise<void> {
    this.sent.push({ borrowerName, message });
  }

  messagesTo(borrowerName: string): string[] {
    return this.sent.filter((entry) => entry.borrowerName === borrowerName).map((entry) => entry.message);
  }
}
