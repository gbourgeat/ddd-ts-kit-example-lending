import type { AuditStamp } from '@ddd-ts-kit/kernel';
import { Organisation } from '@/contexts/identity/domain/aggregates/organisation.aggregate';
import { OrganisationName } from '@/contexts/identity/domain/value-objects/organisation-name.vo';
import type { IdentityOrganisation as OrganisationRow } from '$generated/prisma/client';

export type OrganisationColumns = Omit<OrganisationRow, 'version' | keyof AuditStamp>;

export const OrganisationMapper = {
  toDomain(row: OrganisationRow): Organisation {
    const loaded = Organisation.rehydrate(row.id, {
      name: OrganisationName.create(row.name),
      openedBy: row.openedBy,
      openedAt: row.openedAt,
    });

    loaded.version = row.version;

    return loaded;
  },

  toRow(saved: Organisation): OrganisationColumns {
    const state = saved.toState();

    return { id: saved.id, name: state.name.value, openedBy: state.openedBy, openedAt: state.openedAt };
  },
};
