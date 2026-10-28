import type { UseCaseDeclaration } from '@ddd-ts-kit/auth';
import type { Route } from '@ddd-ts-kit/http';
import type { Platform } from '@/platform/composition/platform';
// ddd-ts-kit:imports
import { consume, subscribeAll } from '@ddd-ts-kit/events';
import {
  conflictOfInterestDeclaredV1 as declaredConflictsDefinition,
  staffMemberAppointedV2 as deciderLevelV2,
} from '@/contexts/branch-network/published-language';
import { delegationTablePublishedV2 as delegationTableV2 } from '@/contexts/credit-policy/published-language';
import { declareDecisionUseCases } from '@/contexts/credit-application/decision/application/authorization/declare-decision-use-cases.policy';
import { DecideApplicationCommand } from '@/contexts/credit-application/decision/application/commands/decide-application/decide-application.command';
import { DecideApplicationHandler } from '@/contexts/credit-application/decision/application/commands/decide-application/decide-application.handler';
import { KeepDeciderLevelCommand } from '@/contexts/credit-application/decision/application/commands/keep-decider-level/keep-decider-level.command';
import { KeepDeciderLevelHandler } from '@/contexts/credit-application/decision/application/commands/keep-decider-level/keep-decider-level.handler';
import { KeepDelegationTableCommand } from '@/contexts/credit-application/decision/application/commands/keep-delegation-table/keep-delegation-table.command';
import { KeepDelegationTableHandler } from '@/contexts/credit-application/decision/application/commands/keep-delegation-table/keep-delegation-table.handler';
import { KeepDeciderLevelIntegrationHandler } from '@/contexts/credit-application/decision/application/integration/handlers/keep-decider-level.integration-handler';
import { KeepDelegationTableIntegrationHandler } from '@/contexts/credit-application/decision/application/integration/handlers/keep-delegation-table.integration-handler';
import { CreditApplicationDecidedPublisher } from '@/contexts/credit-application/decision/application/integration/publishers/credit-application-decided.publisher';
import type { DeciderLevels } from '@/contexts/credit-application/decision/application/ports/decider-levels.port';
import type { DelegationTables } from '@/contexts/credit-application/decision/application/ports/delegation-tables.port';
import type { DeclaredConflictsStore } from '@/contexts/credit-application/decision/application/ports/declared-conflicts-store.port';
import { DeclaredConflictsProjection } from '@/contexts/credit-application/decision/application/projections/declared-conflicts.projection';
import { DeciderLimitReader } from '@/contexts/credit-application/decision/application/projections/decider-limit-reader.projection';
import { ReadDeciderLevelHandler } from '@/contexts/credit-application/decision/application/queries/read-decider-level/read-decider-level.handler';
import { ReadDeciderLevelQuery } from '@/contexts/credit-application/decision/application/queries/read-decider-level/read-decider-level.query';
import { ReadDeclaredConflictsHandler } from '@/contexts/credit-application/decision/application/queries/read-declared-conflicts/read-declared-conflicts.handler';
import { ReadDeclaredConflictsQuery } from '@/contexts/credit-application/decision/application/queries/read-declared-conflicts/read-declared-conflicts.query';
import { ReadDelegationTableHandler } from '@/contexts/credit-application/decision/application/queries/read-delegation-table/read-delegation-table.handler';
import { ReadDelegationTableQuery } from '@/contexts/credit-application/decision/application/queries/read-delegation-table/read-delegation-table.query';
import { PrismaDeciderLevels } from '@/contexts/credit-application/decision/infrastructure/persistence/prisma-decider-levels.repository';
import { PrismaDelegationTables } from '@/contexts/credit-application/decision/infrastructure/persistence/prisma-delegation-tables.repository';
import { CreditApplicationDecided } from '@/contexts/credit-application/file/domain/events/credit-application-decided.event';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import { requires } from '@ddd-ts-kit/auth';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { RequestExceptionCommand } from '@/contexts/credit-application/decision/application/commands/request-exception/request-exception.command';
import { RequestExceptionHandler } from '@/contexts/credit-application/decision/application/commands/request-exception/request-exception.handler';
// /ddd-ts-kit:imports

/** What the handlers of the decision module are given besides the platform: the application file and the declared conflicts. */
interface DecisionDependencies {
  readonly repository: CreditApplicationRepository;
  readonly declaredConflicts: DeclaredConflictsStore;
}

/** What the module decision of the model registers; credit-application.module.ts composes it with the rest of the context. */
export const decisionModule = {
  /** The command and query handlers of the module, with the repositories and readers they are given. */
  registerHandlers(platform: Platform, given: DecisionDependencies): void {
    // ddd-ts-kit:handlers
    const { repository, declaredConflicts } = given;

    platform.queries.register(
      ReadDeclaredConflictsQuery,
      new ReadDeclaredConflictsHandler(declaredConflicts, repository),
      {
        context: 'credit-application',
      },
    );

    const deciderLevels = readModel(platform, 'DeciderLevels', PrismaDeciderLevels);
    const delegationTables = readModel(platform, 'DelegationTables', PrismaDelegationTables);

    registerDeciderLevelHandlers(platform, deciderLevels);
    registerDelegationTableHandlers(platform, delegationTables);
    registerDecideApplication(platform, repository, { deciderLevels, delegationTables, declaredConflicts });

    // /ddd-ts-kit:handlers
  },

  /** What the module does when an event happens: its own events and those of the other contexts. */
  registerReactions(platform: Platform, given: { readonly declaredConflicts: DeclaredConflictsStore }): void {
    // ddd-ts-kit:reactions
    keepDeclaredConflicts(platform, given.declaredConflicts);
    keepReferenceData(platform);
    publishDecision(platform);
    // /ddd-ts-kit:reactions
  },

  /** The jobs of the module, scheduled and in the background. */
  registerJobs(platform: Platform): void {
    // ddd-ts-kit:jobs
    // /ddd-ts-kit:jobs
  },

  /** What each use case of the module requires, or that it is public. */
  useCases(): UseCaseDeclaration[] {
    return [
      // ddd-ts-kit:authorization
      ...declareDecisionUseCases(),
      requires(RequestExceptionCommand, creditApplicationPermissions['application.request-exception'], {
        resource: () => ({ type: 'context', id: 'credit-application' }),
      }),
      // /ddd-ts-kit:authorization
    ];
  },

  /** The routes the module answers, over the buses of the platform. */
  routes(platform: Platform): Route[] {
    return [
      // ddd-ts-kit:routes
      // /ddd-ts-kit:routes
    ];
  },
};

/** Binds a read model of the context, built on the database and the scope of the work, to its token. */
function readModel<T extends object>(
  platform: Platform,
  token: string,
  Model: new (database: Platform['persistence']['database'], scope: Platform['scope']) => T,
): T {
  const instance = new Model(platform.persistence.database, platform.scope);

  return platform.adapter(instance, { kind: 'repository', context: 'credit-application', token });
}

/** The command that keeps the level of each decider and the query that reads it, over the read model the module binds. */
function registerDeciderLevelHandlers(platform: Platform, deciderLevels: DeciderLevels): void {
  platform.commands.register(KeepDeciderLevelCommand, new KeepDeciderLevelHandler(deciderLevels, platform.relations), {
    context: 'credit-application',
  });

  platform.queries.register(ReadDeciderLevelQuery, new ReadDeciderLevelHandler(deciderLevels), {
    context: 'credit-application',
  });
}

/** The command that keeps the delegation tables and the query that reads them, over the read model the module binds. */
function registerDelegationTableHandlers(platform: Platform, delegationTables: DelegationTables): void {
  platform.commands.register(KeepDelegationTableCommand, new KeepDelegationTableHandler(delegationTables), {
    context: 'credit-application',
  });

  platform.queries.register(ReadDelegationTableQuery, new ReadDelegationTableHandler(delegationTables), {
    context: 'credit-application',
  });
}

/** The commands that decide an application and ask for an exception to it, over the repository of the file and the read models of the limits. */
function registerDecideApplication(
  platform: Platform,
  repository: CreditApplicationRepository,
  readModels: {
    readonly deciderLevels: DeciderLevels;
    readonly delegationTables: DelegationTables;
    readonly declaredConflicts: DeclaredConflictsStore;
  },
): void {
  const deciderLimits = new DeciderLimitReader(readModels.deciderLevels, readModels.delegationTables);

  platform.commands.register(
    DecideApplicationCommand,
    new DecideApplicationHandler(repository, deciderLimits, platform.clock, readModels.declaredConflicts),
    { context: 'credit-application' },
  );

  platform.commands.register(
    RequestExceptionCommand,
    new RequestExceptionHandler(repository, deciderLimits, platform.clock, readModels.declaredConflicts),
    { context: 'credit-application' },
  );
}

/** The declared conflicts, kept from the events of branch-network. */
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

/** The integration handlers that keep the delegation table and the level of each decider: each consumer is named here, where the rule reads it. */
function keepReferenceData(platform: Platform): void {
  const { processedEvents: processed, unitOfWork } = platform.persistence;
  const { scope } = platform;

  subscribeAll(platform.subscriberFor('credit-application'), [
    consume(
      delegationTableV2,
      { consumer: 'credit-application.keep-delegation-table', processed, unitOfWork, scope },
      (event) => new KeepDelegationTableIntegrationHandler(platform.commands).handle(event),
    ),
    consume(
      deciderLevelV2,
      { consumer: 'credit-application.keep-decider-level', processed, unitOfWork, scope },
      (event) => new KeepDeciderLevelIntegrationHandler(platform.commands).handle(event),
    ),
  ]);
}

/** The decision of an application is announced to the other contexts. */
function publishDecision(platform: Platform): void {
  const decidedPublisher = platform.adapter(new CreditApplicationDecidedPublisher(platform.publisher, platform.ids), {
    kind: 'domain-event-handler',
    context: 'credit-application',
  });

  platform.domainEvents.on(CreditApplicationDecided.eventName, async (event) => {
    if (event instanceof CreditApplicationDecided) {
      await decidedPublisher.handle(event);
    }
  });
}
