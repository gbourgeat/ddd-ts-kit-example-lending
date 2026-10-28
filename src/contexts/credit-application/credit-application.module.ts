import type { UseCaseDeclaration } from '@ddd-ts-kit/auth';
import type { Type } from '@nestjs/common';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';
import type { Route } from '@ddd-ts-kit/http';
import type { Platform } from '@/platform/composition/platform';
// ddd-ts-kit:imports
import { assessmentModule } from '@/contexts/credit-application/assessment/assessment.module';
import { decisionModule } from '@/contexts/credit-application/decision/decision.module';
import { PrismaDeclaredConflictsStore } from '@/contexts/credit-application/decision/infrastructure/persistence/prisma-declared-conflicts-store.repository';
import { fileModule } from '@/contexts/credit-application/file/file.module';
import { EventStoreCreditApplicationRepository } from '@/contexts/credit-application/file/infrastructure/persistence/event-store-credit-application.repository';
import { offerModule } from '@/contexts/credit-application/offer/offer.module';
// /ddd-ts-kit:imports

export interface CreditApplicationWiring {
  readonly name: string;
  readonly useCases: readonly UseCaseDeclaration[];
  readonly routes: readonly Route[];
  /** Its Nest controllers, listed by the generated `credit-application.controllers.ts`: Nest builds them, the kit serves their methods. */
  readonly controllers: readonly Type<unknown>[];
}

export function creditApplicationModule(platform: Platform): CreditApplicationWiring {
  const shared = sharedBindings(platform);

  registerHandlers(platform, shared);
  registerReactions(platform, shared);
  registerJobs(platform);

  return {
    name: 'credit-application',
    useCases: declaredUseCases(),
    routes: routesOf(platform),
    controllers: creditApplicationControllers,
  };
}

/** What more than one module of the model is given: the event-sourced application file and the declared conflicts. */
function sharedBindings(platform: Platform) {
  const repository = platform.adapter(
    new EventStoreCreditApplicationRepository(platform.eventSourcing.events, platform.eventSourcing.cipher),
    { kind: 'repository', context: 'credit-application', token: 'CreditApplicationRepository' },
  );

  const declaredConflicts = platform.adapter(
    new PrismaDeclaredConflictsStore(platform.persistence.database, platform.scope),
    { kind: 'repository', context: 'credit-application', token: 'DeclaredConflictsStore' },
  );

  return { repository, declaredConflicts };
}

/** The command and query handlers of the context, with the repositories and readers they are given. */
function registerHandlers(platform: Platform, shared: ReturnType<typeof sharedBindings>): void {
  // ddd-ts-kit:handlers
  fileModule.registerHandlers(platform, shared);
  assessmentModule.registerHandlers(platform, shared);
  offerModule.registerHandlers(platform);
  decisionModule.registerHandlers(platform, shared);
  // /ddd-ts-kit:handlers
}

/** What the context does when an event happens: its own events and those of the other contexts. */
function registerReactions(platform: Platform, shared: ReturnType<typeof sharedBindings>): void {
  // ddd-ts-kit:reactions
  fileModule.registerReactions(platform);
  assessmentModule.registerReactions(platform);
  offerModule.registerReactions(platform);
  decisionModule.registerReactions(platform, shared);
  // /ddd-ts-kit:reactions
}

/** The jobs of the context, scheduled and in the background. */
function registerJobs(platform: Platform): void {
  // ddd-ts-kit:jobs
  fileModule.registerJobs(platform);
  assessmentModule.registerJobs(platform);
  offerModule.registerJobs(platform);
  decisionModule.registerJobs(platform);
  // /ddd-ts-kit:jobs
}

/** What each use case requires, or that it is public. */
function declaredUseCases(): UseCaseDeclaration[] {
  return [
    // ddd-ts-kit:authorization
    ...fileModule.useCases(),
    ...assessmentModule.useCases(),
    ...offerModule.useCases(),
    ...decisionModule.useCases(),
    // /ddd-ts-kit:authorization
  ];
}

/** The routes the context answers, over the buses of the platform. */
function routesOf(platform: Platform): Route[] {
  return [
    // ddd-ts-kit:routes
    ...fileModule.routes(platform),
    ...assessmentModule.routes(platform),
    ...offerModule.routes(platform),
    ...decisionModule.routes(platform),
    // /ddd-ts-kit:routes
  ];
}
