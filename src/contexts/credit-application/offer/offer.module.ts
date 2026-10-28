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
import { PrismaOfferRepository } from '@/contexts/credit-application/offer/infrastructure/persistence/prisma-offer.repository';
import { requires } from '@ddd-ts-kit/auth';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { DraftOfferCommand } from '@/contexts/credit-application/offer/application/commands/draft-offer/draft-offer.command';
import { DraftOfferHandler } from '@/contexts/credit-application/offer/application/commands/draft-offer/draft-offer.handler';
import { ReadPreContractualSheetHandler } from '@/contexts/credit-application/offer/application/queries/read-pre-contractual-sheet/read-pre-contractual-sheet.handler';
import { ReadPreContractualSheetQuery } from '@/contexts/credit-application/offer/application/queries/read-pre-contractual-sheet/read-pre-contractual-sheet.query';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import { PrismaProductTerms } from '@/contexts/credit-application/file/infrastructure/persistence/prisma-product-terms.repository';
import type { OfferPricing } from '@/contexts/credit-application/offer/application/ports/offer-pricing.port';
import type { ElectronicSignature } from '@/contexts/credit-application/offer/application/ports/electronic-signature.port';
import { SimulatedElectronicSignature } from '@/contexts/credit-application/offer/infrastructure/external/simulated-electronic-signature.adapter';
import type { OfferRepository } from '@/contexts/credit-application/offer/domain/repositories/offer.repository';
import { PrismaOfferPricing } from '@/contexts/credit-application/offer/infrastructure/persistence/prisma-offer-pricing.repository';
import { IssueOfferCommand } from '@/contexts/credit-application/offer/application/commands/issue-offer/issue-offer.command';
import { IssueOfferHandler } from '@/contexts/credit-application/offer/application/commands/issue-offer/issue-offer.handler';
import { AcceptOfferCommand } from '@/contexts/credit-application/offer/application/commands/accept-offer/accept-offer.command';
import { AcceptOfferHandler } from '@/contexts/credit-application/offer/application/commands/accept-offer/accept-offer.handler';
import { EventStoreCreditApplicationRepository } from '@/contexts/credit-application/file/infrastructure/persistence/event-store-credit-application.repository';
import { WithdrawLoanCommand } from '@/contexts/credit-application/offer/application/commands/withdraw-loan/withdraw-loan.command';
import { WithdrawLoanHandler } from '@/contexts/credit-application/offer/application/commands/withdraw-loan/withdraw-loan.handler';
import { AuthorizePayoutCommand } from '@/contexts/credit-application/offer/application/commands/authorize-payout/authorize-payout.command';
import { AuthorizePayoutHandler } from '@/contexts/credit-application/offer/application/commands/authorize-payout/authorize-payout.handler';
import { CreditApplicationWithdrawnPublisher } from '@/contexts/credit-application/offer/application/integration/publishers/credit-application-withdrawn.publisher';
import { CreditApplicationWithdrawn } from '@/contexts/credit-application/offer/domain/events/credit-application-withdrawn.event';
import { CreditApplicationPayoutAuthorisedPublisher } from '@/contexts/credit-application/offer/application/integration/publishers/credit-application-payout-authorised.publisher';
import { CreditApplicationPayoutAuthorised } from '@/contexts/credit-application/offer/domain/events/credit-application-payout-authorised.event';
// /ddd-ts-kit:imports

/** What the module offer of the model registers; credit-application.module.ts composes it with the rest of the context. */
export const offerModule = {
  /** The command and query handlers of the module, with the repositories and readers they are given. */
  registerHandlers(platform: Platform, given: { readonly repository: CreditApplicationRepository }): void {
    // ddd-ts-kit:handlers
    registerRateGridHandlers(platform);
    registerLegalMaximumRateHandlers(platform);

    const offerRepository = platform.adapter(
      new PrismaOfferRepository(platform.persistence.database, platform.scope, platform.clock),
      { kind: 'repository', context: 'credit-application', token: 'OfferRepository' },
    );

    const pricing = platform.adapter(new PrismaOfferPricing(platform.persistence.database, platform.scope), {
      kind: 'repository',
      context: 'credit-application',
      token: 'OfferPricing',
    });

    const signature = platform.adapter(new SimulatedElectronicSignature(), {
      kind: 'external',
      context: 'credit-application',
      token: 'ElectronicSignature',
    });

    registerOfferCommands(platform, { offerRepository, pricing, signature, applications: given.repository });

    platform.commands.register(
      AcceptOfferCommand,
      new AcceptOfferHandler(offerRepository, { signature, clock: platform.clock }),
      { context: 'credit-application' },
    );

    const creditApplicationRepository = platform.adapter(
      new EventStoreCreditApplicationRepository(platform.eventSourcing.events, platform.eventSourcing.cipher),
      { kind: 'repository', context: 'credit-application', token: 'CreditApplicationRepository' },
    );

    registerWithdrawalAndPayoutHandlers(platform, {
      applications: creditApplicationRepository,
      offers: offerRepository,
    });
    // /ddd-ts-kit:handlers
  },

  /** What the module does when an event happens: its own events and those of the other contexts. */
  registerReactions(platform: Platform): void {
    // ddd-ts-kit:reactions
    keepReferenceData(platform);

    const creditApplicationWithdrawnPublisher = platform.adapter(
      new CreditApplicationWithdrawnPublisher(platform.publisher, platform.ids),
      { kind: 'domain-event-handler', context: 'credit-application' },
    );

    platform.domainEvents.on(CreditApplicationWithdrawn.eventName, async (event) => {
      if (event instanceof CreditApplicationWithdrawn) {
        await creditApplicationWithdrawnPublisher.handle(event);
      }
    });

    const creditApplicationPayoutAuthorisedPublisher = platform.adapter(
      new CreditApplicationPayoutAuthorisedPublisher(
        platform.publisher,
        platform.ids,
        new PrismaOfferRepository(platform.persistence.database, platform.scope, platform.clock),
        new EventStoreCreditApplicationRepository(platform.eventSourcing.events, platform.eventSourcing.cipher),
      ),
      { kind: 'domain-event-handler', context: 'credit-application' },
    );

    platform.domainEvents.on(CreditApplicationPayoutAuthorised.eventName, async (event) => {
      if (event instanceof CreditApplicationPayoutAuthorised) {
        await creditApplicationPayoutAuthorisedPublisher.handle(event);
      }
    });
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
      requires(DraftOfferCommand, creditApplicationPermissions['offer.draft'], {
        resource: () => ({ type: 'context', id: 'credit-application' }),
      }),
      requires(ReadPreContractualSheetQuery, creditApplicationPermissions['offer.read-sheet'], {
        resource: () => ({ type: 'context', id: 'credit-application' }),
      }),
      requires(IssueOfferCommand, creditApplicationPermissions['offer.issue'], {
        resource: () => ({ type: 'context', id: 'credit-application' }),
      }),
      requires(AcceptOfferCommand, creditApplicationPermissions['offer.accept'], {
        resource: (command) => ({ type: 'offer', id: command.offerId }),
      }),
      requires(WithdrawLoanCommand, creditApplicationPermissions['application.withdraw'], {
        resource: (command) => ({ type: 'application', id: command.applicationId }),
      }),
      requires(AuthorizePayoutCommand, creditApplicationPermissions['application.authorise-payout'], {
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

/** The commands and the query of the offer: drafting, reading the pre-contractual sheet, and issuing the offer. */
function registerOfferCommands(
  platform: Platform,
  given: {
    readonly offerRepository: OfferRepository;
    readonly pricing: OfferPricing;
    readonly signature: ElectronicSignature;
    readonly applications: CreditApplicationRepository;
  },
): void {
  const { offerRepository, pricing } = given;

  platform.commands.register(
    DraftOfferCommand,
    new DraftOfferHandler(offerRepository, {
      applications: given.applications,
      pricing,
      productTerms: new PrismaProductTerms(platform.persistence.database, platform.scope),
      ids: platform.ids,
      clock: platform.clock,
      relations: platform.relations,
    }),
    { context: 'credit-application' },
  );

  platform.queries.register(ReadPreContractualSheetQuery, new ReadPreContractualSheetHandler(offerRepository), {
    context: 'credit-application',
  });

  platform.commands.register(
    IssueOfferCommand,
    new IssueOfferHandler(offerRepository, { pricing, clock: platform.clock }),
    {
      context: 'credit-application',
    },
  );
}

/** The borrower's withdrawal and the operator's payout authorisation, checked against the signing of the offer. */
function registerWithdrawalAndPayoutHandlers(
  platform: Platform,
  given: {
    readonly applications: CreditApplicationRepository;
    readonly offers: OfferRepository;
  },
): void {
  const { applications, offers } = given;

  const diligence = platform.adapter(new InProcessCustomerDiligenceGateway(platform.customerDiligence), {
    kind: 'gateway',
    context: 'credit-application',
    token: 'CustomerDiligenceGateway',
  });

  platform.commands.register(
    WithdrawLoanCommand,
    new WithdrawLoanHandler(applications, { offers, clock: platform.clock }),
    { context: 'credit-application' },
  );

  platform.commands.register(
    AuthorizePayoutCommand,
    new AuthorizePayoutHandler(applications, { offers, diligence, clock: platform.clock }),
    { context: 'credit-application' },
  );
}

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
