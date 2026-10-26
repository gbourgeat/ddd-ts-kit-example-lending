import type { AuditStamp } from '@ddd-ts-kit/kernel';
import { Delegation } from '@/contexts/identity/domain/aggregates/delegation.aggregate';
import { DelegationPeriod } from '@/contexts/identity/domain/value-objects/delegation-period.vo';
import { MemberRight } from '@/contexts/identity/domain/vocabularies/member-right.vocabulary';
import type { IdentityDelegation as DelegationRow } from '$generated/prisma/client';

const SEPARATOR = ',';

export type DelegationColumns = Omit<DelegationRow, 'version' | keyof AuditStamp>;

export const DelegationMapper = {
  toDomain(row: DelegationRow): Delegation {
    const loaded = Delegation.rehydrate(row.id, {
      organisationId: row.organisationId,
      delegatorId: row.delegatorId,
      delegateId: row.delegateId,
      rights: rightsOf(row.rights),
      period: DelegationPeriod.create(row.startsAt, row.endsAt),
      endedAt: row.endedAt ?? undefined,
    });

    loaded.version = row.version;

    return loaded;
  },

  toRow(saved: Delegation): DelegationColumns {
    const state = saved.toState();

    return {
      id: saved.id,
      organisationId: state.organisationId,
      delegatorId: state.delegatorId,
      delegateId: state.delegateId,
      rights: state.rights.join(SEPARATOR),
      startsAt: state.period.startsAt,
      endsAt: state.period.endsAt,
      endedAt: state.endedAt ?? null,
    };
  },
};

/** The rights of a stored delegation, those the vocabulary no longer names left out. */
function rightsOf(stored: string): MemberRight[] {
  const lent = stored.split(SEPARATOR);

  return Object.values(MemberRight).filter((right) => lent.includes(right));
}
