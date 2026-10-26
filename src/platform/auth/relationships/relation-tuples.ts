import { SchemaCheckedTupleStore, type RelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import { createTupleStore } from '@/platform/auth/relationships/create-tuple-store';
import { relationshipSchema } from '@/platform/auth/relationships/relationship-schema';

/** The relationships the authorizer reads: a tuple that the schema does not know is refused when it is written. */
export const relationTuples: RelationTupleStore = new SchemaCheckedTupleStore(relationshipSchema, createTupleStore());
