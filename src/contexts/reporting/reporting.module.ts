import type { UseCaseDeclaration } from '@ddd-ts-kit/auth';
import type { Type } from '@nestjs/common';
import { reportingControllers } from '@/contexts/reporting/reporting.controllers';
import type { Route } from '@ddd-ts-kit/http';
import type { Platform } from '@/platform/composition/platform';
// ddd-ts-kit:imports
import { consume, subscribeAll } from '@ddd-ts-kit/events';
import { creditApplicationSubmittedV2 as applicationCountDefinition } from '@/contexts/credit-application/published-language';
import { ApplicationCountProjection } from '@/contexts/reporting/application/projections/application-count.projection';
import { PrismaApplicationCounts } from '@/contexts/reporting/infrastructure/persistence/prisma-application-counts.repository';
// /ddd-ts-kit:imports

export interface ReportingWiring {
  readonly name: string;
  readonly useCases: readonly UseCaseDeclaration[];
  readonly routes: readonly Route[];
  /** Its Nest controllers, listed by the generated `reporting.controllers.ts`: Nest builds them, the kit serves their methods. */
  readonly controllers: readonly Type<unknown>[];
}

export function reportingModule(platform: Platform): ReportingWiring {
  registerHandlers(platform);
  registerReactions(platform);
  registerJobs(platform);

  return {
    name: 'reporting',
    useCases: declaredUseCases(),
    routes: routesOf(platform),
    controllers: reportingControllers,
  };
}

/** The command and query handlers of the context, with the repositories and readers they are given. */
function registerHandlers(platform: Platform): void {
  // ddd-ts-kit:handlers
  // /ddd-ts-kit:handlers
}

/** What the context does when an event happens: its own events and those of the other contexts. */
function registerReactions(platform: Platform): void {
  // ddd-ts-kit:reactions
  const applicationCounts = new PrismaApplicationCounts(platform.persistence.database, platform.scope);
  const applicationCountProjection = new ApplicationCountProjection(applicationCounts);

  subscribeAll(platform.subscriberFor('reporting'), [
    consume(
      applicationCountDefinition,
      {
        consumer: 'reporting.application-count',
        processed: platform.persistence.processedEvents,
        unitOfWork: platform.persistence.unitOfWork,
        scope: platform.scope,
      },
      async (event) => {
        await applicationCountProjection.submitted(event);
      },
    ),
  ]);
  // /ddd-ts-kit:reactions
}

/** The jobs of the context, scheduled and in the background. */
function registerJobs(platform: Platform): void {
  // ddd-ts-kit:jobs
  // /ddd-ts-kit:jobs
}

/** What each use case requires, or that it is public. */
function declaredUseCases(): UseCaseDeclaration[] {
  return [
    // ddd-ts-kit:authorization
    // /ddd-ts-kit:authorization
  ];
}

/** The routes the context answers, over the buses of the platform. */
function routesOf(platform: Platform): Route[] {
  return [
    // ddd-ts-kit:routes
    // /ddd-ts-kit:routes
  ];
}
