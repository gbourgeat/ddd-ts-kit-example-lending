import { SignedInGrantsAuthorizer, type Authorizer } from '@ddd-ts-kit/auth';
import { RelationBasedAuthorizer, type RelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import { relationshipSchema } from '@/platform/auth/relationships/relationship-schema';
import { signedInGrants } from '@/platform/auth/authorization/signed-in-grants';

/** Relationships: is there a path of stored tuples from this element to the actor? `explain` says which, for debugging. */
export function createAuthorizer(relations: RelationTupleStore): Authorizer {
  const model = new RelationBasedAuthorizer({ schema: relationshipSchema, store: relations });

  return new SignedInGrantsAuthorizer({ grants: signedInGrants, otherwise: model });
}
