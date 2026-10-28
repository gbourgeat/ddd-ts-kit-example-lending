import type { UseCaseDeclaration } from '@ddd-ts-kit/auth';
import type { Route } from '@ddd-ts-kit/http';
import type { Platform } from '@/platform/composition/platform';
// ddd-ts-kit:imports
import { consume, subscribeAll } from '@ddd-ts-kit/events';
import {
  legalMaximumRatePublishedV2 as legalMaximumRateV2,
  rateGridPublishedV2 as rateGridV2,
} from '@/contexts/credit-policy/published-language';
import { declareOfferUseCases } from '@/contexts/credit-application/offer/application/authorization/declare-offer-use-cases.policy';
import { KeepLegalMaximumRateCommand } from '@/contexts/credit-application/offer/application/commands/keep-legal-maximum-rate/keep-legal-maximum-rate.command';
import { KeepLegalMaximumRateHandler } from '@/contexts/credit-application/offer/application/commands/keep-legal-maximum-rate/keep-legal-maximum-rate.handler';
import { KeepRateGridCommand } from '@/contexts/credit-application/offer/application/commands/keep-rate-grid/keep-rate-grid.command';
import { KeepRateGridHandler } from '@/contexts/credit-application/offer/application/commands/keep-rate-grid/keep-rate-grid.handler';
import { KeepLegalMaximumRateIntegrationHandler } from '@/contexts/credit-application/offer/application/integration/handlers/keep-legal-maximum-rate.integration-handler';
import { KeepRateGridIntegrationHandler } from '@/contexts/credit-application/offer/application/integration/handlers/keep-rate-grid.integration-handler';
import { ReadLegalMaximumRateHandler } from '@/contexts/credit-application/offer/application/queries/read-legal-maximum-rate/read-legal-maximum-rate.handler';
import { ReadLegalMaximumRateQuery } from '@/contexts/credit-application/offer/application/queries/read-legal-maximum-rate/read-legal-maximum-rate.query';
import { ReadRateGridHandler } from '@/contexts/credit-application/offer/application/queries/read-rate-grid/read-rate-grid.handler';
import { ReadRateGridQuery } from '@/contexts/credit-application/offer/application/queries/read-rate-grid/read-rate-grid.query';
import { InProcessCustomerDiligenceGateway } from '@/contexts/credit-application/offer/infrastructure/external/in-process-customer-diligence.gateway';
import { PrismaLegalMaximumRates } from '@/contexts/credit-application/offer/infrastructure/persistence/prisma-legal-maximum-rates.repository';
import { PrismaRateGrids } from '@/contexts/credit-application/offer/infrastructure/persistence/prisma-rate-grids.repository';
// /ddd-ts-kit:imports

/** What the module offer of the model registers; credit-application.module.ts composes it with the rest of the context. */
export const offerModule = {
  /** The command and query handlers of the module, with the repositories and readers they are given. */
  registerHandlers(platform: Platform): void {
    // ddd-ts-kit:handlers
    platform.adapter(new InProcessCustomerDiligenceGateway(platform.customerDiligence), {
      kind: 'gateway',
      context: 'credit-application',
      token: 'CustomerDiligenceGateway',
    });

    registerRateGridHandlers(platform);
    registerLegalMaximumRateHandlers(platform);
    // /ddd-ts-kit:handlers
  },

  /** What the module does when an event happens: its own events and those of the other contexts. */
  registerReactions(platform: Platform): void {
    // ddd-ts-kit:reactions
    keepReferenceData(platform);
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
      ...declareOfferUseCases(),
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

/** The command that keeps the rate grids and the query that reads them, over the read model the module binds. */
function registerRateGridHandlers(platform: Platform): void {
  const rateGrids = platform.adapter(new PrismaRateGrids(platform.persistence.database, platform.scope), {
    kind: 'repository',
    context: 'credit-application',
    token: 'RateGrids',
  });

  platform.commands.register(KeepRateGridCommand, new KeepRateGridHandler(rateGrids), {
    context: 'credit-application',
  });

  platform.queries.register(ReadRateGridQuery, new ReadRateGridHandler(rateGrids), {
    context: 'credit-application',
  });
}

/** The command that keeps the legal maximum rates and the query that reads them, over the read model the module binds. */
function registerLegalMaximumRateHandlers(platform: Platform): void {
  const legalMaximumRates = platform.adapter(
    new PrismaLegalMaximumRates(platform.persistence.database, platform.scope),
    {
      kind: 'repository',
      context: 'credit-application',
      token: 'LegalMaximumRates',
    },
  );

  platform.commands.register(KeepLegalMaximumRateCommand, new KeepLegalMaximumRateHandler(legalMaximumRates), {
    context: 'credit-application',
  });

  platform.queries.register(ReadLegalMaximumRateQuery, new ReadLegalMaximumRateHandler(legalMaximumRates), {
    context: 'credit-application',
  });
}

/** The integration handlers that keep the rate grids and the legal maximum rates: each consumer is named here, where the rule reads it. */
function keepReferenceData(platform: Platform): void {
  const { processedEvents: processed, unitOfWork } = platform.persistence;
  const { scope } = platform;

  subscribeAll(platform.subscriberFor('credit-application'), [
    consume(rateGridV2, { consumer: 'credit-application.keep-rate-grid', processed, unitOfWork, scope }, (event) =>
      new KeepRateGridIntegrationHandler(platform.commands).handle(event),
    ),
    consume(
      legalMaximumRateV2,
      { consumer: 'credit-application.keep-legal-maximum-rate', processed, unitOfWork, scope },
      (event) => new KeepLegalMaximumRateIntegrationHandler(platform.commands).handle(event),
    ),
  ]);
}
