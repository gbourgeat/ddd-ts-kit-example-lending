import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { IdentityDocumentExpired } from '@/contexts/customer-due-diligence/domain/errors/identity-document-expired.error';

describe('IdentityDocumentExpired', () => {
  it('refuses for customer with the code IDENTITY_DOCUMENT_EXPIRED', () => {
    const error = IdentityDocumentExpired.forCustomer('customer-1');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('IDENTITY_DOCUMENT_EXPIRED');
    expect(error.message).toBe('The identity document is past its expiry date.');
    expect(error.facts).toEqual({ customerId: 'customer-1' });
  });
});
