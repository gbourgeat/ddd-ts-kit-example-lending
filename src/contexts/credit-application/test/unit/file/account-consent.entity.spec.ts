import { describe, expect, it } from '@jest/globals';
import { AccountConsent } from '@/contexts/credit-application/file/domain/entities/account-consent.entity';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

describe('AccountConsent', () => {
  it('is identified by its id, not by its attributes', () => {
    const givenAt = new Date('2026-01-01T00:00:00.000Z');
    const first = AccountConsent.give('account-consent-1', givenAt);
    const same = AccountConsent.rehydrate('account-consent-1', first.toState());
    const other = AccountConsent.give('account-consent-2', givenAt);

    expect(first.equals(same)).toBe(true);
    expect(first.equals(other)).toBe(false);
  });

  it('gives back the state it was rehydrated from, as a copy', () => {
    const state = { givenAt: new Date('2026-01-01T00:00:00.000Z'), expiresAt: new Date('2026-04-01T00:00:00.000Z') };
    const stored = AccountConsent.rehydrate('account-consent-1', state);

    expect(stored.toState()).toEqual(state);
    expect(stored.toState()).not.toBe(state);
  });

  it('expires 90 days after it is given', () => {
    const givenAt = new Date('2026-01-01T00:00:00.000Z');

    const consent = AccountConsent.give('account-consent-1', givenAt);

    expect(consent.expiresAt).toEqual(new Date(givenAt.getTime() + 90 * MILLISECONDS_PER_DAY));
  });

  it('is no longer valid at the instant it expires', () => {
    const givenAt = new Date('2026-01-01T00:00:00.000Z');
    const consent = AccountConsent.give('account-consent-1', givenAt);

    expect(consent.isValidAt(new Date(consent.expiresAt.getTime() - 1))).toBe(true);
    expect(consent.isValidAt(consent.expiresAt)).toBe(false);
  });
});
