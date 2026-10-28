import { describe, expect, it } from '@jest/globals';
import { RemoteBorrowerIdentity } from '@/contexts/servicing/ledger/infrastructure/external/remote-borrower-identity.adapter';

const identified = { name: 'Ada Lovelace', birthDate: '1980-05-01' };

describe('RemoteBorrowerIdentity', () => {
  it('answers the name of an identified customer, as customer-due-diligence publishes it', async () => {
    const adapter = new RemoteBorrowerIdentity({ identityOf: async () => identified });

    expect(await adapter.nameOf('customer-1')).toBe('Ada Lovelace');
  });

  it('answers no name, without failing, for a customer customer-due-diligence does not identify', async () => {
    const adapter = new RemoteBorrowerIdentity({ identityOf: async () => undefined });

    expect(await adapter.nameOf('customer-9')).toBeUndefined();
  });
});
