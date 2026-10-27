import type { UseCaseDeclaration } from '@ddd-ts-kit/auth';
import type { Type } from '@nestjs/common';
import { branchNetworkControllers } from '@/contexts/branch-network/branch-network.controllers';
import type { Route } from '@ddd-ts-kit/http';
import type { Platform } from '@/platform/composition/platform';
// ddd-ts-kit:imports
import { PrismaBranchRepository } from '@/contexts/branch-network/infrastructure/persistence/prisma-branch.repository';
import { requires } from '@ddd-ts-kit/auth';
import { branchNetworkPermissions } from '@/contexts/branch-network/branch-network.permissions';
import { OpenBranchCommand } from '@/contexts/branch-network/application/commands/open-branch/open-branch.command';
import { OpenBranchHandler } from '@/contexts/branch-network/application/commands/open-branch/open-branch.handler';
// /ddd-ts-kit:imports

export interface BranchNetworkWiring {
  readonly name: string;
  readonly useCases: readonly UseCaseDeclaration[];
  readonly routes: readonly Route[];
  /** Its Nest controllers, listed by the generated `branch-network.controllers.ts`: Nest builds them, the kit serves their methods. */
  readonly controllers: readonly Type<unknown>[];
}

export function branchNetworkModule(platform: Platform): BranchNetworkWiring {
  registerHandlers(platform);
  registerReactions(platform);
  registerJobs(platform);

  return {
    name: 'branch-network',
    useCases: declaredUseCases(),
    routes: routesOf(platform),
    controllers: branchNetworkControllers,
  };
}

/** The command and query handlers of the context, with the repositories and readers they are given. */
function registerHandlers(platform: Platform): void {
  // ddd-ts-kit:handlers
  const branchRepository = platform.adapter(
    new PrismaBranchRepository(platform.persistence.database, platform.scope, platform.clock),
    { kind: 'repository', context: 'branch-network', token: 'BranchRepository' },
  );

  platform.commands.register(OpenBranchCommand, new OpenBranchHandler(branchRepository, platform.ids, platform.clock), {
    context: 'branch-network',
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
    requires(OpenBranchCommand, branchNetworkPermissions['branch.open'], {
      resource: () => ({ type: 'context', id: 'branch-network' }),
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
