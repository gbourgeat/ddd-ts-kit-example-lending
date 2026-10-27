import type { RelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import { PrismaRelationTupleStore } from '@/platform/auth/relationships/prisma-relation-tuple-store';
import type { Database } from '@/platform/database/database';

/** The relation tuples, in the table of the database, written in the transaction of the change they describe. */
export function createTupleStore(database: Database): RelationTupleStore {
  return new PrismaRelationTupleStore(database);
}
