import type { Authorizer } from '@ddd-ts-kit/auth';
import { RelationBasedAuthorizer } from '@ddd-ts-kit/auth/rebac';
import { relationTuples } from '@/platform/auth/relationships/relation-tuples';
import { relationshipSchema } from '@/platform/auth/relationships/relationship-schema';

/** Relationships: is there a path of stored tuples from this element to the actor? `explain` says which, for debugging. */
export function createAuthorizer(): Authorizer {
  return new RelationBasedAuthorizer({ schema: relationshipSchema, store: relationTuples });
}
