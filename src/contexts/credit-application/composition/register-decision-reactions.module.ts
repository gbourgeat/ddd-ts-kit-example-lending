import { consume, subscribeAll } from '@ddd-ts-kit/events';
import { conflictOfInterestDeclaredV1 as declaredConflictsDefinition } from '@/contexts/branch-network/published-language';
import type { DeclaredConflictsStore } from '@/contexts/credit-application/decision/application/ports/declared-conflicts-store.port';
import { DeclaredConflictsProjection } from '@/contexts/credit-application/decision/application/projections/declared-conflicts.projection';
import type { Platform } from '@/platform/composition/platform';

/** The reactions of the decision module: the declared conflicts. The delegation table and the level of each decider are kept by their commands. */
export function registerDecisionReactions(platform: Platform, declaredConflicts: DeclaredConflictsStore): void {
  keepDeclaredConflicts(platform, declaredConflicts);
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
