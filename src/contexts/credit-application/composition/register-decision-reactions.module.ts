import { consume, subscribeAll } from '@ddd-ts-kit/events';
import {
  conflictOfInterestDeclaredV1 as declaredConflictsDefinition,
  staffMemberAppointedV2 as deciderLevelDefinition,
} from '@/contexts/branch-network/published-language';
import { DeciderLevelProjection } from '@/contexts/credit-application/decision/application/projections/decider-level.projection';
import type { DeclaredConflictsStore } from '@/contexts/credit-application/decision/application/ports/declared-conflicts-store.port';
import { DeclaredConflictsProjection } from '@/contexts/credit-application/decision/application/projections/declared-conflicts.projection';
import type { Platform } from '@/platform/composition/platform';

/** The reactions of the decision module: the conflicts and the level of each decider. The delegation table is kept by its command. */
export function registerDecisionReactions(platform: Platform, declaredConflicts: DeclaredConflictsStore): void {
  keepDeclaredConflicts(platform, declaredConflicts);
  keepDeciderLevels(platform);
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

function keepDeciderLevels(platform: Platform): void {
  const deciderLevelProjection = new DeciderLevelProjection();
  const { processedEvents: processed, unitOfWork } = platform.persistence;
  const { scope } = platform;

  subscribeAll(platform.subscriberFor('credit-application'), [
    consume(
      deciderLevelDefinition,
      { consumer: 'credit-application.decider-level', processed, unitOfWork, scope },
      (event) => deciderLevelProjection.appointed(event),
    ),
  ]);
}
