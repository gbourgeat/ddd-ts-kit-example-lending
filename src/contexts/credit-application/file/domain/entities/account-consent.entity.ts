import { Entity } from '@ddd-ts-kit/kernel';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const CONSENT_VALIDITY_DAYS = 90;

export interface AccountConsentState {
  readonly givenAt: Date;
  readonly expiresAt: Date;
}

/** The applicant's consent to read their bank accounts for one application: it expires 90 days after it is given. */
export class AccountConsent extends Entity<string> {
  private constructor(
    id: string,
    private state: AccountConsentState,
  ) {
    super(id);
  }

  /** No invariant of its own: the expiry is computed here from the instant the consent is given. */
  static create(id: string, state: AccountConsentState): AccountConsent {
    return new AccountConsent(id, state);
  }

  static give(id: string, givenAt: Date): AccountConsent {
    const expiresAt = new Date(givenAt.getTime() + CONSENT_VALIDITY_DAYS * MILLISECONDS_PER_DAY);

    return new AccountConsent(id, { givenAt, expiresAt });
  }

  static rehydrate(id: string, state: AccountConsentState): AccountConsent {
    return new AccountConsent(id, state);
  }

  get expiresAt(): Date {
    return this.state.expiresAt;
  }

  /** Valid strictly before its expiry instant: on the 90th day after it is given, at the instant of expiry, it is no longer valid. */
  isValidAt(instant: Date): boolean {
    return instant.getTime() < this.state.expiresAt.getTime();
  }

  toState(): AccountConsentState {
    return { ...this.state };
  }
}
