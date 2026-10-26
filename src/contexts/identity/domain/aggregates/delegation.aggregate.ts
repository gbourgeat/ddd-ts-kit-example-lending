import { AggregateRoot } from '@ddd-ts-kit/kernel';
import { DelegationNotActive } from '@/contexts/identity/domain/errors/delegation-not-active.error';
import { DelegationToOneself } from '@/contexts/identity/domain/errors/delegation-to-oneself.error';
import { DelegationWithNoRight } from '@/contexts/identity/domain/errors/delegation-with-no-right.error';
import { RightNotInRole } from '@/contexts/identity/domain/errors/right-not-in-role.error';
import { DelegationGranted } from '@/contexts/identity/domain/events/delegation-granted.event';
import { DelegationRevoked } from '@/contexts/identity/domain/events/delegation-revoked.event';
import type { DelegationPeriod } from '@/contexts/identity/domain/value-objects/delegation-period.vo';
import type { OrganisationRights } from '@/contexts/identity/domain/value-objects/organisation-rights.vo';
import type { MemberRight } from '@/contexts/identity/domain/vocabularies/member-right.vocabulary';

export interface DelegationState {
  readonly organisationId: string;
  readonly delegatorId: string;
  readonly delegateId: string;
  readonly rights: readonly MemberRight[];
  readonly period: DelegationPeriod;
  readonly endedAt: Date | undefined;
}

/** What a delegation lends, and what its delegator may do by their role: a delegation lends nothing beyond it. */
export interface DelegationTerms extends Omit<DelegationState, 'endedAt'> {
  readonly held: OrganisationRights;
}

/**
 * A member lends some of the rights of their role to another member of the organisation, for a
 * bounded period: the delegate acts in their own name, with those rights, until the end of the
 * period or until the delegation is revoked. Every grant and every end is a fact, and every use
 * case is recorded in the audit trail of the project.
 */
export class Delegation extends AggregateRoot<string> {
  private constructor(
    id: string,
    private state: DelegationState,
  ) {
    super(id);
  }

  static grant(id: string, { held, ...terms }: DelegationTerms, now: Date): Delegation {
    assertLendable(terms, held);

    const granted = new Delegation(id, { ...terms, endedAt: undefined });
    const { organisationId, delegatorId, delegateId, rights, period } = terms;
    const facts = { organisationId, delegatorId, delegateId, rights, startsAt: period.startsAt, endsAt: period.endsAt };

    granted.record(new DelegationGranted(id, now, facts));

    return granted;
  }

  static rehydrate(id: string, state: DelegationState): Delegation {
    return new Delegation(id, state);
  }

  /** Withdrawn by hand while it holds or before it starts: an ended delegation cannot be. */
  revoke(now: Date): void {
    if (this.state.endedAt !== undefined || now.getTime() >= this.state.period.endsAt.getTime()) {
      throw DelegationNotActive.forDelegation(this.id);
    }

    this.end(now);
  }

  /** Ends because the delegator or the delegate no longer stands as it did when it was granted; already ended, nothing changes. */
  end(now: Date): void {
    if (this.state.endedAt !== undefined) {
      return;
    }

    const { organisationId, delegatorId, delegateId } = this.state;

    this.state = { ...this.state, endedAt: now };
    this.record(new DelegationRevoked(this.id, now, { organisationId, delegatorId, delegateId }));
  }

  isActiveAt(instant: Date): boolean {
    return this.state.endedAt === undefined && this.state.period.includes(instant);
  }

  get organisationId(): string {
    return this.state.organisationId;
  }

  get delegatorId(): string {
    return this.state.delegatorId;
  }

  get delegateId(): string {
    return this.state.delegateId;
  }

  get rights(): readonly MemberRight[] {
    return this.state.rights;
  }

  get period(): DelegationPeriod {
    return this.state.period;
  }

  toState(): DelegationState {
    return { ...this.state };
  }
}

function assertLendable(terms: Omit<DelegationState, 'endedAt'>, held: OrganisationRights): void {
  if (terms.delegateId === terms.delegatorId) {
    throw DelegationToOneself.forAccount(terms.delegatorId);
  }

  if (terms.rights.length === 0) {
    throw DelegationWithNoRight.withNoRight();
  }

  const beyond = terms.rights.find((right) => !held.includes(right));

  if (beyond !== undefined) {
    throw RightNotInRole.forRight(beyond);
  }
}
