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
    object: 'context:branch-network',
    relation: 'operator',
    subject: 'system:system:branch-network.assign-identified-customer',
  },
  {
    object: 'context:data-protection',
    relation: 'eraser',
    subject: 'system:system:data-protection.erase-personal-data-past-retention',
  },
  {
    object: 'context:customer-due-diligence',
    relation: 'operator',
    subject: 'system:system:EndRelationshipOnSanctionsMatchEventHandler',
  },
  {
    object: 'context:customer-due-diligence',
    relation: 'operator',
    subject: 'system:system:customer-due-diligence.flag-overdue-due-diligence',
  },
  {
    object: 'context:credit-application',
    relation: 'keeper',
    subject: 'system:system:credit-application.keep-delegation-table',
  },
  {
    object: 'context:credit-application',
    relation: 'keeper',
    subject: 'system:system:credit-application.keep-decider-level',
  },
  {
    object: 'context:credit-application',
    relation: 'keeper',
    subject: 'system:system:credit-application.keep-rate-grid',
  },
  {
    object: 'context:credit-application',
    relation: 'keeper',
    subject: 'system:system:credit-application.keep-legal-maximum-rate',
  },
  {
    object: 'context:customer-due-diligence',
    relation: 'operator',
    subject: 'system:system:customer-due-diligence.erase-personal-data-past-retention',
  },
  {
    object: 'context:credit-application',
    relation: 'operator',
    subject: 'system:system:credit-application.erase-personal-data-past-retention',
  },
  {
    object: 'context:servicing',
    relation: 'operator',
    subject: 'system:system:servicing.erase-personal-data-past-retention',
  },
  // /ddd-ts-kit:system-grants
];

/** Written when the application starts, before any job runs; writing a tuple that exists changes nothing. */
export function relateSystemActors(relations: RelationTupleStore): Promise<void> {
  return relations.write(systemRelationships);
}
