import { SchemaCheckedTupleStore, type RelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import { createTupleStore } from '@/platform/auth/relationships/create-tuple-store';
import { relationshipSchema } from '@/platform/auth/relationships/relationship-schema';
import type { Database } from '@/platform/database/database';

/** The relationships the authorizer reads: a tuple that the schema does not know is refused when it is written. */
export function createRelationTuples(database: Database): RelationTupleStore {
  return new SchemaCheckedTupleStore(relationshipSchema, createTupleStore(database));
}
