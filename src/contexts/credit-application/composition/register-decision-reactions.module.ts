import { consume, subscribeAll } from '@ddd-ts-kit/events';
import {
  conflictOfInterestDeclaredV1 as declaredConflictsDefinition,
  staffMemberAppointedV2 as deciderLevelDefinition,
} from '@/contexts/branch-network/published-language';
import { delegationTablePublishedV2 as delegationTableDefinition } from '@/contexts/credit-policy/published-language';
import { DelegationTableProjection } from '@/contexts/credit-application/decision/application/projections/delegation-table.projection';
import { DeciderLevelProjection } from '@/contexts/credit-application/decision/application/projections/decider-level.projection';
import type { DeclaredConflictsStore } from '@/contexts/credit-application/decision/application/ports/declared-conflicts-store.port';
import { DeclaredConflictsProjection } from '@/contexts/credit-application/decision/application/projections/declared-conflicts.projection';
import type { Platform } from '@/platform/composition/platform';

/** The reactions of the decision module: the conflicts, the delegation table and the level of each decider. */
export function registerDecisionReactions(platform: Platform, declaredConflicts: DeclaredConflictsStore): void {
  keepDeclaredConflicts(platform, declaredConflicts);
  keepDelegationAndLevels(platform);
}

function keepDeclaredConflicts(platform: Platform, declaredConflicts: DeclaredConflictsStore): void {
  const declaredConflictsProjection = new DeclaredConflictsProjection(declaredConflicts);

  subscribeAll(platform.subscriberFor('credit-application'), [
    consume(
      declaredConflictsDefinition,
      {
        consumer: 'credit-application.declared-conflicts',
        processed: platform.persistence.processedEvents,
        unitOfWork: platform.persistence.unitOfWork,
        scope: platform.scope,
      },
      (event) => declaredConflictsProjection.declared(event),
    ),
  ]);
}

function keepDelegationAndLevels(platform: Platform): void {
  const delegationTableProjection = new DelegationTableProjection();
  const deciderLevelProjection = new DeciderLevelProjection();
  const { processedEvents: processed, unitOfWork } = platform.persistence;
  const { scope } = platform;

  subscribeAll(platform.subscriberFor('credit-application'), [
    consume(
      delegationTableDefinition,
      { consumer: 'credit-application.delegation-table', processed, unitOfWork, scope },
      (event) => delegationTableProjection.published(event),
    ),
    consume(
      deciderLevelDefinition,
      { consumer: 'credit-application.decider-level', processed, unitOfWork, scope },
      (event) => deciderLevelProjection.appointed(event),
    ),
  ]);
}
