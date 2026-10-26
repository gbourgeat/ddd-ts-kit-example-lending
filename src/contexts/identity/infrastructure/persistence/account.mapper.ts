import type { AuditStamp } from '@ddd-ts-kit/kernel';
import { Account } from '@/contexts/identity/domain/aggregates/account.aggregate';
import { DisplayName } from '@/contexts/identity/domain/value-objects/display-name.vo';
import { EmailAddress } from '@/contexts/identity/domain/value-objects/email-address.vo';
import type { IdentityAccount as AccountRow } from '$generated/prisma/client';

export type AccountColumns = Omit<AccountRow, 'version' | keyof AuditStamp>;

export const AccountMapper = {
  toDomain(row: AccountRow): Account {
    const loaded = Account.rehydrate(row.id, {
      email: EmailAddress.create(row.email),
      displayName: DisplayName.create(row.displayName),
      status: row.status,
      provisionedAt: row.provisionedAt,
      deactivatedAt: row.deactivatedAt ?? undefined,
    });

    loaded.version = row.version;

    return loaded;
  },

  toRow(saved: Account): AccountColumns {
    const state = saved.toState();

    return {
      id: saved.id,
      email: state.email.value,
      displayName: state.displayName.value,
      status: state.status,
      provisionedAt: state.provisionedAt,
      deactivatedAt: state.deactivatedAt ?? null,
    };
  },
};
