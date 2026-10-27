import { optimisticUpdate } from '@ddd-ts-kit/prisma';
import { stampCreation, stampUpdate, type Clock, type ExecutionScope } from '@ddd-ts-kit/kernel';
import type { Invitation } from '@/contexts/identity/domain/aggregates/invitation.aggregate';
import type { InvitationRepository } from '@/contexts/identity/domain/repositories/invitation.repository';
import type { Database } from '@/platform/database/database';
import {
  InvitationMapper,
  type InvitationColumns,
} from '@/contexts/identity/infrastructure/persistence/invitation.mapper';

type VersionedInvitation = InvitationColumns & { readonly version: number };

export class PrismaInvitationRepository implements InvitationRepository {
  constructor(
    private readonly database: Database,
    private readonly scope: ExecutionScope,
    private readonly clock: Clock,
  ) {}

  async findById(id: string): Promise<Invitation | undefined> {
    const row = await invitationsOf(this.database).findUnique({ where: { id } });

    return row === null ? undefined : InvitationMapper.toDomain(row);
  }

  async findByTokenHash(tokenHash: string): Promise<Invitation | undefined> {
    const row = await invitationsOf(this.database).findUnique({ where: { tokenHash } });

    return row === null ? undefined : InvitationMapper.toDomain(row);
  }

  async save(saved: Invitation): Promise<void> {
    await optimisticUpdate(saved, async ({ expected, next }) => {
      const state = { ...InvitationMapper.toRow(saved), version: next };
      const written = expected === 0 ? await this.insert(state) : await this.update(state, expected);

      return written.count;
    });
  }

  private insert(state: VersionedInvitation): Promise<{ count: number }> {
    const row = { ...state, ...stampCreation(this.scope, this.clock) };

    return invitationsOf(this.database).createMany({ data: [row], skipDuplicates: true });
  }

  private update(state: VersionedInvitation, expected: number): Promise<{ count: number }> {
    return invitationsOf(this.database).updateMany({
      where: { id: state.id, version: expected },
      data: { ...state, ...stampUpdate(this.scope, this.clock) },
    });
  }
}

/** The invitations on the client of the unit of work, which every statement of this file goes through. */
function invitationsOf(database: Database): ReturnType<Database['client']>['identityInvitation'] {
  return database.client().identityInvitation;
}
