import { describe, expect, it } from '@jest/globals';
import { CreditApplicationDocumentAttached } from '@/contexts/credit-application/file/domain/events/credit-application-document-attached.event';

describe('CreditApplicationDocumentAttached', () => {
  it('is named after the context, the aggregate and the fact, and carries the key and the description of the document', () => {
    const event = new CreditApplicationDocumentAttached(
      'credit-application-1',
      new Date('2026-01-01T00:00:00.000Z'),
      'files/payslip-1.pdf',
      'application/pdf',
      2048,
    );

    expect(event.name).toBe('credit-application.credit-application.document-attached');
    expect(event.aggregateId).toBe('credit-application-1');
    expect(event.documentKey).toBe('files/payslip-1.pdf');
    expect(event.mediaType).toBe('application/pdf');
    expect(event.sizeBytes).toBe(2048);
  });
});
