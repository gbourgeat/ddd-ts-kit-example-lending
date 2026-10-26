import { describe, expect, it } from '@jest/globals';
import { CryptoInvitationTokens } from '@/contexts/identity/infrastructure/external/crypto-invitation-tokens.adapter';

describe('CryptoInvitationTokens', () => {
  it('issues a new token each time, fit for an address, with the digest it is found by', () => {
    const tokens = new CryptoInvitationTokens();
    const first = tokens.issue();
    const second = tokens.issue();

    expect(first.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(first.token).not.toBe(second.token);
    expect(first.digest).toBe(tokens.digestOf(first.token));
    expect(first.digest).toMatch(/^[0-9a-f]{64}$/);
  });
});
