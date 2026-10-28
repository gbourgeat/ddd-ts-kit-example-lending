import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { IdentityValidityService } from '@/contexts/customer-due-diligence/domain/services/identity-validity.service';
import { aPersonIdentity } from '@/contexts/customer-due-diligence/test/builders/customer.builder';

const bornAt = new Date('2026-01-10T00:00:00.000Z');

describe('IdentityValidityService', () => {
  it('holds no state of its own', () => {
    expect(Object.keys(new IdentityValidityService())).toEqual([]);
  });

  it('accepts the identity facts of a person whose document is valid and whose proof of address is recent', () => {
    const validity = new IdentityValidityService();

    expect(() => validity.check('customer-9', aPersonIdentity(), bornAt)).not.toThrow();
  });

  it('refuses an identity whose document expired on the day', () => {
    const validity = new IdentityValidityService();
    const expired = aPersonIdentity({ documentExpiresOn: new Date('2020-01-01T00:00:00.000Z') });

    expectRefusal(() => validity.check('customer-9', expired, bornAt), 'IDENTITY_DOCUMENT_EXPIRED');
  });

  it('refuses an identity whose proof of address is older than three months', () => {
    const validity = new IdentityValidityService();
    const stale = aPersonIdentity({ addressProofDatedOn: new Date('2025-06-01T00:00:00.000Z') });

    expectRefusal(() => validity.check('customer-9', stale, bornAt), 'PROOF_OF_ADDRESS_TOO_OLD');
  });
});
