import type { UseCaseDeclaration } from '@ddd-ts-kit/auth';
import type { Type } from '@nestjs/common';
import { financialCrimeControllers } from '@/contexts/financial-crime/financial-crime.controllers';
import type { Route } from '@ddd-ts-kit/http';
import type { Platform } from '@/platform/composition/platform';
// ddd-ts-kit:imports
import { PrismaAlertRepository } from '@/contexts/financial-crime/infrastructure/persistence/prisma-alert.repository';
import { requires } from '@ddd-ts-kit/auth';
import { financialCrimePermissions } from '@/contexts/financial-crime/financial-crime.permissions';
import { RaiseAlertCommand } from '@/contexts/financial-crime/application/commands/raise-alert/raise-alert.command';
import { RaiseAlertHandler } from '@/contexts/financial-crime/application/commands/raise-alert/raise-alert.handler';
import { CloseAlertCommand } from '@/contexts/financial-crime/application/commands/close-alert/close-alert.command';
import { CloseAlertHandler } from '@/contexts/financial-crime/application/commands/close-alert/close-alert.handler';
// /ddd-ts-kit:imports

export interface FinancialCrimeWiring {
  readonly name: string;
  readonly useCases: readonly UseCaseDeclaration[];
  readonly routes: readonly Route[];
  /** Its Nest controllers, listed by the generated `financial-crime.controllers.ts`: Nest builds them, the kit serves their methods. */
  readonly controllers: readonly Type<unknown>[];
}

export function financialCrimeModule(platform: Platform): FinancialCrimeWiring {
  registerHandlers(platform);
  registerReactions(platform);
  registerJobs(platform);

  return {
    name: 'financial-crime',
    useCases: declaredUseCases(),
    routes: routesOf(platform),
    controllers: financialCrimeControllers,
  };
}

/** The command and query handlers of the context, with the repositories and readers they are given. */
function registerHandlers(platform: Platform): void {
  // ddd-ts-kit:handlers
  const alertRepository = platform.adapter(
    new PrismaAlertRepository(platform.persistence.database, platform.scope, platform.clock),
    { kind: 'repository', context: 'financial-crime', token: 'AlertRepository' },
  );

  platform.commands.register(RaiseAlertCommand, new RaiseAlertHandler(alertRepository, platform.ids, platform.clock), {
    context: 'financial-crime',
  });

  platform.commands.register(CloseAlertCommand, new CloseAlertHandler(alertRepository, platform.clock), {
    context: 'financial-crime',
  });
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
    requires(RaiseAlertCommand, financialCrimePermissions['alert.raise'], {
      resource: () => ({ type: 'context', id: 'financial-crime' }),
    }),
    requires(CloseAlertCommand, financialCrimePermissions['alert.close'], {
      resource: () => ({ type: 'context', id: 'financial-crime' }),
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
