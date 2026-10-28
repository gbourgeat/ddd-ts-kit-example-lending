import type { Permission } from '@ddd-ts-kit/auth';
import { RelationBasedAuthorizer, type RelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import type { Actor } from '@ddd-ts-kit/kernel';
import { relationshipSchema } from '@/platform/auth/relationships/relationship-schema';

/** One question the relationships were asked on the way to a decision, and whether it held. */
export interface AccessStep {
  readonly text: string;
  readonly holds: boolean;
}

/** Why the relationships grant or refuse a permission on an element: the questions asked, in order, as data. */
export class AccessExplainer {
  private readonly authorizer: RelationBasedAuthorizer;

  constructor(relations: RelationTupleStore) {
    this.authorizer = new RelationBasedAuthorizer({ schema: relationshipSchema, store: relations });
  }

  async explain(
    actor: Actor,
    permission: Permission,
    resource: { readonly type: string; readonly id: string },
  ): Promise<readonly AccessStep[]> {
    const explanation = await this.authorizer.explain({ actor, permission, resource });

    return explanation.trace.map((step) => ({ text: step.text, holds: step.answer === 'yes' }));
  }
}
