import type { RelationTuple, RelationTupleStore } from '@ddd-ts-kit/auth/rebac';

/**
 * What the application does on its own behalf: the relationships of its system actors, one per
 * scheduled job whose command is protected (`generate job` adds it). An integration event
 * handler that sends a protected command needs its line too.
 */
const systemRelationships: readonly RelationTuple[] = [
  // ddd-ts-kit:system-grants
  {
    object: 'context:branch-network',
    relation: 'operator',
    subject: 'system:system:OpenPortfolioForAdvisorEventHandler',
  },
  { object: 'context:brokerage', relation: 'operator', subject: 'system:system:brokerage.check-registration' },
  {
    object: 'context:data-protection',
    relation: 'eraser',
    subject: 'system:system:data-protection.erase-personal-data-past-retention',
  },
  // /ddd-ts-kit:system-grants
];

/** Written when the application starts, before any job runs; writing a tuple that exists changes nothing. */
export function relateSystemActors(relations: RelationTupleStore): Promise<void> {
  return relations.write(systemRelationships);
}
