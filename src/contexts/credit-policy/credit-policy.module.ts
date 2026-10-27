import type { UseCaseDeclaration } from '@ddd-ts-kit/auth';
import type { Type } from '@nestjs/common';
import { creditPolicyControllers } from '@/contexts/credit-policy/credit-policy.controllers';
import type { Route } from '@ddd-ts-kit/http';
import type { Platform } from '@/platform/composition/platform';
// ddd-ts-kit:imports
import { PrismaRateGridRepository } from '@/contexts/credit-policy/infrastructure/persistence/prisma-rate-grid.repository';
import { requires } from '@ddd-ts-kit/auth';
import { creditPolicyPermissions } from '@/contexts/credit-policy/credit-policy.permissions';
import { PublishRateGridCommand } from '@/contexts/credit-policy/application/commands/publish-rate-grid/publish-rate-grid.command';
import { PublishRateGridHandler } from '@/contexts/credit-policy/application/commands/publish-rate-grid/publish-rate-grid.handler';
import { PrismaProductRepository } from '@/contexts/credit-policy/infrastructure/persistence/prisma-product.repository';
import { DefineProductCommand } from '@/contexts/credit-policy/application/commands/define-product/define-product.command';
import { DefineProductHandler } from '@/contexts/credit-policy/application/commands/define-product/define-product.handler';
import { PrismaLegalMaximumRateRepository } from '@/contexts/credit-policy/infrastructure/persistence/prisma-legal-maximum-rate.repository';
import { PublishLegalMaximumRateCommand } from '@/contexts/credit-policy/application/commands/publish-legal-maximum-rate/publish-legal-maximum-rate.command';
import { PublishLegalMaximumRateHandler } from '@/contexts/credit-policy/application/commands/publish-legal-maximum-rate/publish-legal-maximum-rate.handler';
import { PrismaDelegationTableRepository } from '@/contexts/credit-policy/infrastructure/persistence/prisma-delegation-table.repository';
import { SetDelegationTableCommand } from '@/contexts/credit-policy/application/commands/set-delegation-table/set-delegation-table.command';
import { SetDelegationTableHandler } from '@/contexts/credit-policy/application/commands/set-delegation-table/set-delegation-table.handler';
// /ddd-ts-kit:imports

export interface CreditPolicyWiring {
  readonly name: string;
  readonly useCases: readonly UseCaseDeclaration[];
  readonly routes: readonly Route[];
  /** Its Nest controllers, listed by the generated `credit-policy.controllers.ts`: Nest builds them, the kit serves their methods. */
  readonly controllers: readonly Type<unknown>[];
}

export function creditPolicyModule(platform: Platform): CreditPolicyWiring {
  registerHandlers(platform);
  registerReactions(platform);
  registerJobs(platform);

  return {
    name: 'credit-policy',
    useCases: declaredUseCases(),
    routes: routesOf(platform),
    controllers: creditPolicyControllers,
  };
}

/** The command and query handlers of the context, with the repositories and readers they are given. */
function registerHandlers(platform: Platform): void {
  // ddd-ts-kit:handlers
  const rateGridRepository = platform.adapter(
    new PrismaRateGridRepository(platform.persistence.database, platform.scope, platform.clock),
    { kind: 'repository', context: 'credit-policy', token: 'RateGridRepository' },
  );

  platform.commands.register(
    PublishRateGridCommand,
    new PublishRateGridHandler(rateGridRepository, platform.ids, platform.clock),
    { context: 'credit-policy' },
  );

  const productRepository = platform.adapter(
    new PrismaProductRepository(platform.persistence.database, platform.scope, platform.clock),
    { kind: 'repository', context: 'credit-policy', token: 'ProductRepository' },
  );

  platform.commands.register(
    DefineProductCommand,
    new DefineProductHandler(productRepository, platform.ids, platform.clock),
    { context: 'credit-policy' },
  );

  const legalMaximumRateRepository = platform.adapter(
    new PrismaLegalMaximumRateRepository(platform.persistence.database, platform.scope, platform.clock),
    { kind: 'repository', context: 'credit-policy', token: 'LegalMaximumRateRepository' },
  );

  platform.commands.register(
    PublishLegalMaximumRateCommand,
    new PublishLegalMaximumRateHandler(legalMaximumRateRepository, platform.ids, platform.clock),
    { context: 'credit-policy' },
  );

  const delegationTableRepository = platform.adapter(
    new PrismaDelegationTableRepository(platform.persistence.database, platform.scope, platform.clock),
    { kind: 'repository', context: 'credit-policy', token: 'DelegationTableRepository' },
  );

  platform.commands.register(
    SetDelegationTableCommand,
    new SetDelegationTableHandler(delegationTableRepository, platform.ids, platform.clock),
    { context: 'credit-policy' },
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
    requires(PublishRateGridCommand, creditPolicyPermissions['rate-grid.publish'], {
      resource: () => ({ type: 'context', id: 'credit-policy' }),
    }),
    requires(DefineProductCommand, creditPolicyPermissions['product.define'], {
      resource: () => ({ type: 'context', id: 'credit-policy' }),
    }),
    requires(PublishLegalMaximumRateCommand, creditPolicyPermissions['legal-maximum-rate.publish'], {
      resource: () => ({ type: 'context', id: 'credit-policy' }),
    }),
    requires(SetDelegationTableCommand, creditPolicyPermissions['delegation-table.set'], {
      resource: () => ({ type: 'context', id: 'credit-policy' }),
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
