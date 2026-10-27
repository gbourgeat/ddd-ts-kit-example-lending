import { optimisticUpdate } from '@ddd-ts-kit/prisma';
import { stampCreation, stampUpdate, type Clock, type ExecutionScope } from '@ddd-ts-kit/kernel';
import type { Organisation } from '@/contexts/identity/domain/aggregates/organisation.aggregate';
import type { OrganisationRepository } from '@/contexts/identity/domain/repositories/organisation.repository';
import type { Database } from '@/platform/database/database';
import {
  OrganisationMapper,
  type OrganisationColumns,
} from '@/contexts/identity/infrastructure/persistence/organisation.mapper';

type VersionedOrganisation = OrganisationColumns & { readonly version: number };

export class PrismaOrganisationRepository implements OrganisationRepository {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
    private readonly clock: Clock,
  ) {}

  async findById(id: string): Promise<Organisation | undefined> {
    const row = await organisationsOf(this.database).findUnique({ where: { id } });

    return row === null ? undefined : OrganisationMapper.toDomain(row);
  }

  async save(saved: Organisation): Promise<void> {
    await optimisticUpdate(saved, async ({ expected, next }) => {
      const state = { ...OrganisationMapper.toRow(saved), version: next };
      const written = expected === 0 ? await this.insert(state) : await this.update(state, expected);

      return written.count;
    });
  }

  private insert(state: VersionedOrganisation): Promise<{ count: number }> {
    const row = { ...state, ...stampCreation(this.scope, this.clock) };

    return organisationsOf(this.database).createMany({ data: [row], skipDuplicates: true });
  }

  private update(state: VersionedOrganisation, expected: number): Promise<{ count: number }> {
    return organisationsOf(this.database).updateMany({
      where: { id: state.id, version: expected },
      data: { ...state, ...stampUpdate(this.scope, this.clock) },
    });
  }
}

/** The organisations on the client of the unit of work, which every statement of this file goes through. */
function organisationsOf(database: Database): ReturnType<Database['client']>['identityOrganisation'] {
  return database.client().identityOrganisation;
}
