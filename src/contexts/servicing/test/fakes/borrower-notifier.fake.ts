import type { BorrowerNotifier } from '@/contexts/servicing/arrears/application/ports/borrower-notifier.port';

export class FakeBorrowerNotifier implements BorrowerNotifier {
  readonly sent: { borrowerName: string; message: string }[] = [];

  async notify(borrowerName: string, message: string): Promise<void> {
    this.sent.push({ borrowerName, message });
  }
}
