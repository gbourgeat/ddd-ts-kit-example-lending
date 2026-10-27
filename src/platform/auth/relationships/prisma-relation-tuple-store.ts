import type { RelationTuple, RelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import type { Database } from '@/platform/database/database';

/** The tuples on the client of the unit of work, so that a tuple is committed or rolled back with the change it describes. */
export class PrismaRelationTupleStore implements RelationTupleStore {
  constructor(private readonly database: Database) {}

  async write(tuples: readonly RelationTuple[]): Promise<void> {
    await this.tuples().createMany({ data: tuples.map(tupleOf), skipDuplicates: true });
  }

  async delete(tuples: readonly RelationTuple[]): Promise<void> {
    await this.tuples().deleteMany({ where: { OR: tuples.map(tupleOf) } });
  }

  async readByObject(object: string, relation: string): Promise<readonly RelationTuple[]> {
    const rows = await this.tuples().findMany({ where: { object, relation } });

    return rows.map(tupleOf);
  }

  async readBySubject(subject: string): Promise<readonly RelationTuple[]> {
    const rows = await this.tuples().findMany({ where: { subject } });

    return rows.map(tupleOf);
  }

  private tuples(): ReturnType<Database['client']>['relationTuple'] {
    return this.database.client().relationTuple;
  }
}

function tupleOf({ object, relation, subject }: RelationTuple): RelationTuple {
  return { object, relation, subject };
}
