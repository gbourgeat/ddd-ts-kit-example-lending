import type { UseCaseDeclaration } from '@ddd-ts-kit/auth';
import type { Type } from '@nestjs/common';
import { servicingControllers } from '@/contexts/servicing/servicing.controllers';
import type { Route } from '@ddd-ts-kit/http';
import type { Platform } from '@/platform/composition/platform';
// ddd-ts-kit:imports
// /ddd-ts-kit:imports

export interface ServicingWiring {
  readonly name: string;
  readonly useCases: readonly UseCaseDeclaration[];
  readonly routes: readonly Route[];
  /** Its Nest controllers, listed by the generated `servicing.controllers.ts`: Nest builds them, the kit serves their methods. */
  readonly controllers: readonly Type<unknown>[];
}

export function servicingModule(platform: Platform): ServicingWiring {
  registerHandlers(platform);
  registerReactions(platform);
  registerJobs(platform);

  return {
    name: 'servicing',
    useCases: declaredUseCases(),
    routes: routesOf(platform),
    controllers: servicingControllers,
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
