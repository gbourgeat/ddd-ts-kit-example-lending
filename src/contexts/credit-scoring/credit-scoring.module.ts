import type { UseCaseDeclaration } from '@ddd-ts-kit/auth';
import type { Type } from '@nestjs/common';
import { creditScoringControllers } from '@/contexts/credit-scoring/credit-scoring.controllers';
import type { Route } from '@ddd-ts-kit/http';
import type { Platform } from '@/platform/composition/platform';
// ddd-ts-kit:imports
import { PrismaScoringModelRepository } from '@/contexts/credit-scoring/infrastructure/persistence/prisma-scoring-model.repository';
import { requires } from '@ddd-ts-kit/auth';
import { creditScoringPermissions } from '@/contexts/credit-scoring/credit-scoring.permissions';
import { PublishScoringModelVersionCommand } from '@/contexts/credit-scoring/application/commands/publish-scoring-model-version/publish-scoring-model-version.command';
import { PublishScoringModelVersionHandler } from '@/contexts/credit-scoring/application/commands/publish-scoring-model-version/publish-scoring-model-version.handler';
// /ddd-ts-kit:imports

export interface CreditScoringWiring {
  readonly name: string;
  readonly useCases: readonly UseCaseDeclaration[];
  readonly routes: readonly Route[];
  /** Its Nest controllers, listed by the generated `credit-scoring.controllers.ts`: Nest builds them, the kit serves their methods. */
  readonly controllers: readonly Type<unknown>[];
}

export function creditScoringModule(platform: Platform): CreditScoringWiring {
  registerHandlers(platform);
  registerReactions(platform);
  registerJobs(platform);

  return {
    name: 'credit-scoring',
    useCases: declaredUseCases(),
    routes: routesOf(platform),
    controllers: creditScoringControllers,
  };
}

/** The command and query handlers of the context, with the repositories and readers they are given. */
function registerHandlers(platform: Platform): void {
  // ddd-ts-kit:handlers
  const scoringModelRepository = platform.adapter(
    new PrismaScoringModelRepository(platform.persistence.database, platform.scope, platform.clock),
    { kind: 'repository', context: 'credit-scoring', token: 'ScoringModelRepository' },
  );

  platform.commands.register(
    PublishScoringModelVersionCommand,
    new PublishScoringModelVersionHandler(scoringModelRepository, platform.ids, platform.clock),
    { context: 'credit-scoring' },
  );
  // /ddd-ts-kit:handlers
}

/** What the context does when an event happens: its own events and those of the other contexts. */
function registerReactions(platform: Platform): void {
  // ddd-ts-kit:reactions
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
    requires(PublishScoringModelVersionCommand, creditScoringPermissions['scoring-model.publish'], {
      resource: () => ({ type: 'context', id: 'credit-scoring' }),
    }),
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
