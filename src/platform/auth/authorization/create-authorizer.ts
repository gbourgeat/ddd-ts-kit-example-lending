import { SignedInGrantsAuthorizer, type Authorizer } from '@ddd-ts-kit/auth';
import { RelationBasedAuthorizer } from '@ddd-ts-kit/auth/rebac';
import { relationTuples } from '@/platform/auth/relationships/relation-tuples';
import { relationshipSchema } from '@/platform/auth/relationships/relationship-schema';
import { signedInGrants } from '@/platform/auth/authorization/signed-in-grants';

/** Relationships: is there a path of stored tuples from this element to the actor? `explain` says which, for debugging. */
export function createAuthorizer(): Authorizer {
  const model = new RelationBasedAuthorizer({ schema: relationshipSchema, store: relationTuples });

  return new SignedInGrantsAuthorizer({ grants: signedInGrants, otherwise: model });
}
