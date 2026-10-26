import { describe, expect, it } from '@jest/globals';
import { given } from '@ddd-ts-kit/testing';
import { Delegation, type DelegationTerms } from '@/contexts/identity/domain/aggregates/delegation.aggregate';
import { DelegationPeriod } from '@/contexts/identity/domain/value-objects/delegation-period.vo';
import { OrganisationRights } from '@/contexts/identity/domain/value-objects/organisation-rights.vo';
import { MemberRight } from '@/contexts/identity/domain/vocabularies/member-right.vocabulary';
import { aDelegation } from '@/contexts/identity/test/builders/delegation.builder';

const startsAt = new Date('2026-03-01T00:00:00.000Z');
const endsAt = new Date('2026-03-15T00:00:00.000Z');
const during = new Date('2026-03-05T00:00:00.000Z');
const period = DelegationPeriod.create(startsAt, endsAt);
const adminRights = OrganisationRights.of('acme', 'subject-ada', [MemberRight.ReadMembers, MemberRight.InviteMembers]);

describe('Delegation', () => {
  it('lends rights the delegator holds, for a period, and announces its terms', () => {
    const granted = Delegation.grant('delegation-1', lending([MemberRight.InviteMembers]), startsAt);

    expect(granted.isActiveAt(during)).toBe(true);

    expect(granted.pullEvents()).toEqual([
      {
        name: 'identity.delegation.granted',
        aggregateId: 'delegation-1',
        occurredAt: startsAt,
        facts: {
          organisationId: 'acme',
          delegatorId: 'subject-ada',
          delegateId: 'subject-grace',
          rights: [MemberRight.InviteMembers],
          startsAt,
          endsAt,
        },
      },
    ]);
  });

  it('lends nothing beyond what the delegator holds, nothing to the delegator, and something', () => {
    expect(() => Delegation.grant('d', lending([MemberRight.ManageMembers]), startsAt)).toThrow(
      expect.objectContaining({ code: 'DELEGATION_BEYOND_RIGHTS', facts: { right: MemberRight.ManageMembers } }),
    );

    expect(() => Delegation.grant('d', lending([MemberRight.InviteMembers], 'subject-ada'), startsAt)).toThrow(
      expect.objectContaining({ code: 'DELEGATION_TO_ONESELF' }),
    );

    expect(() => Delegation.grant('d', lending([]), startsAt)).toThrow(
      expect.objectContaining({ code: 'DELEGATION_WITHOUT_RIGHTS' }),
    );
  });

  it('is rehydrated in its stored state without recording a new fact', () => {
    const stored = aDelegation().build();
    const loaded = Delegation.rehydrate(stored.id, stored.toState());

    expect(loaded.toState()).toEqual(stored.toState());
    expect(loaded.pullEvents()).toEqual([]);
  });
});

describe('A granted delegation', () => {
  it('holds during its period only', () => {
    const granted = aDelegation().between(startsAt, endsAt).build();

    expect([granted.isActiveAt(startsAt), granted.isActiveAt(during), granted.isActiveAt(endsAt)]).toEqual([
      true,
      true,
      false,
    ]);
  });

  it('is revoked while it holds, and announces it', () => {
    given(aDelegation().identifiedBy('delegation-1').between(startsAt, endsAt))
      .when((delegation) => delegation.revoke(during))
      .thenEvents([
        {
          name: 'identity.delegation.revoked',
          aggregateId: 'delegation-1',
          facts: { organisationId: 'acme', delegatorId: 'account-owner', delegateId: 'account-deputy' },
        },
      ])
      .thenState((delegation) => expect(delegation.isActiveAt(during)).toBe(false));
  });

  it('is revoked no more once it ended', () => {
    given(aDelegation().between(startsAt, endsAt))
      .when((delegation) => delegation.revoke(endsAt))
      .thenError('DELEGATION_NOT_ACTIVE');

    const revoked = aDelegation().between(startsAt, endsAt).build();

    revoked.revoke(during);

    given(revoked)
      .when((delegation) => delegation.revoke(during))
      .thenError('DELEGATION_NOT_ACTIVE');
  });

  it('ends once with the standing it was granted under, and a second end changes nothing', () => {
    given(aDelegation().between(startsAt, endsAt))
      .when((delegation) => {
        delegation.end(during);
        delegation.end(during);
      })
      .thenEventNames(['identity.delegation.revoked']);
  });
});

function lending(rights: readonly MemberRight[], delegateId = 'subject-grace'): DelegationTerms {
  return { organisationId: 'acme', delegatorId: 'subject-ada', delegateId, rights, period, held: adminRights };
}
