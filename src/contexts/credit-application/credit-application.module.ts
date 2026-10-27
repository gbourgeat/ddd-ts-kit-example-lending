import type { UseCaseDeclaration } from '@ddd-ts-kit/auth';
import type { Type } from '@nestjs/common';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';
import type { Route } from '@ddd-ts-kit/http';
import type { Platform } from '@/platform/composition/platform';
// ddd-ts-kit:imports

import { publicUseCase, requires } from '@ddd-ts-kit/auth';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { SubmitApplicationCommand } from '@/contexts/credit-application/file/application/commands/submit-application/submit-application.command';
import { SubmitApplicationHandler } from '@/contexts/credit-application/file/application/commands/submit-application/submit-application.handler';
import { CreditApplicationSubmittedPublisher } from '@/contexts/credit-application/file/application/integration/publishers/credit-application-submitted.publisher';
import { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';
import { GiveAccountConsentCommand } from '@/contexts/credit-application/file/application/commands/give-account-consent/give-account-consent.command';
import { GiveAccountConsentHandler } from '@/contexts/credit-application/file/application/commands/give-account-consent/give-account-consent.handler';
import { SearchApplicationsHandler } from '@/contexts/credit-application/file/application/queries/search-applications/search-applications.handler';
import { SearchApplicationsQuery } from '@/contexts/credit-application/file/application/queries/search-applications/search-applications.query';
import { PrismaSearchApplicationsReader } from '@/contexts/credit-application/file/infrastructure/persistence/prisma-search-applications.reader';
import { PrismaApplicationListProjection } from '@/contexts/credit-application/file/infrastructure/persistence/prisma-application-list-projection.repository';
import { ApplicationListOnSubmittedEventHandler } from '@/contexts/credit-application/file/application/event-handlers/application-list-on-submitted.event-handler';
import { NameCoBorrowerCommand } from '@/contexts/credit-application/file/application/commands/name-co-borrower/name-co-borrower.command';
import { NameCoBorrowerHandler } from '@/contexts/credit-application/file/application/commands/name-co-borrower/name-co-borrower.handler';
import { EventStoreCreditApplicationRepository } from '@/contexts/credit-application/file/infrastructure/persistence/event-store-credit-application.repository';
import { NameGuarantorCommand } from '@/contexts/credit-application/file/application/commands/name-guarantor/name-guarantor.command';
import { NameGuarantorHandler } from '@/contexts/credit-application/file/application/commands/name-guarantor/name-guarantor.handler';
import { CorrectEntryCommand } from '@/contexts/credit-application/file/application/commands/correct-entry/correct-entry.command';
import { CorrectEntryHandler } from '@/contexts/credit-application/file/application/commands/correct-entry/correct-entry.handler';
import { consume, subscribeAll } from '@ddd-ts-kit/events';
import { conflictOfInterestDeclaredV1 as declaredConflictsDefinition } from '@/contexts/branch-network/published-language';
import { DeclaredConflictsProjection } from '@/contexts/credit-application/decision/application/projections/declared-conflicts.projection';
import { PrismaDeclaredConflictsStore } from '@/contexts/credit-application/decision/infrastructure/persistence/prisma-declared-conflicts-store.repository';
// /ddd-ts-kit:imports

export interface CreditApplicationWiring {
  readonly name: string;
  readonly useCases: readonly UseCaseDeclaration[];
  readonly routes: readonly Route[];
  /** Its Nest controllers, listed by the generated `credit-application.controllers.ts`: Nest builds them, the kit serves their methods. */
  readonly controllers: readonly Type<unknown>[];
}

export function creditApplicationModule(platform: Platform): CreditApplicationWiring {
  registerHandlers(platform);
  registerReactions(platform);
  registerJobs(platform);

  return {
    name: 'credit-application',
    useCases: declaredUseCases(),
    routes: routesOf(platform),
    controllers: creditApplicationControllers,
  };
}

/** The command and query handlers of the context, with the repositories and readers they are given. */
function registerHandlers(platform: Platform): void {
  // ddd-ts-kit:handlers
  const creditApplicationRepository = platform.adapter(
    new EventStoreCreditApplicationRepository(platform.eventSourcing.events, platform.eventSourcing.cipher),
    { kind: 'repository', context: 'credit-application', token: 'CreditApplicationRepository' },
  );

  platform.commands.register(
    SubmitApplicationCommand,
    new SubmitApplicationHandler(creditApplicationRepository, platform.ids, platform.clock),
    { context: 'credit-application' },
  );

  platform.commands.register(
    GiveAccountConsentCommand,
    new GiveAccountConsentHandler(creditApplicationRepository, platform.clock),
    { context: 'credit-application' },
  );

  const searchApplicationsReader = platform.adapter(
    new PrismaSearchApplicationsReader(platform.persistence.database, platform.scope),
    { kind: 'repository', context: 'credit-application', token: 'SearchApplicationsReader' },
  );

  platform.queries.register(
    SearchApplicationsQuery,
    new SearchApplicationsHandler(searchApplicationsReader, platform.access),
    { context: 'credit-application' },
  );

  platform.commands.register(
    NameCoBorrowerCommand,
    new NameCoBorrowerHandler(creditApplicationRepository, platform.clock),
    { context: 'credit-application' },
  );

  platform.commands.register(
    NameGuarantorCommand,
    new NameGuarantorHandler(creditApplicationRepository, platform.clock),
    { context: 'credit-application' },
  );

  platform.commands.register(
    CorrectEntryCommand,
    new CorrectEntryHandler(creditApplicationRepository, platform.clock),
    { context: 'credit-application' },
  );
  // /ddd-ts-kit:handlers
}

/** What the context does when an event happens: its own events and those of the other contexts. */
function registerReactions(platform: Platform): void {
  // ddd-ts-kit:reactions
  const creditApplicationSubmittedPublisher = platform.adapter(
    new CreditApplicationSubmittedPublisher(platform.publisher, platform.ids),
    { kind: 'domain-event-handler', context: 'credit-application' },
  );

  platform.domainEvents.on(CreditApplicationSubmitted.eventName, async (event) => {
    if (event instanceof CreditApplicationSubmitted) {
      await creditApplicationSubmittedPublisher.handle(event);
    }
  });

  const applicationListOnSubmittedEventHandler = platform.adapter(
    new ApplicationListOnSubmittedEventHandler(
      platform.adapter(new PrismaApplicationListProjection(platform.persistence.database, platform.scope), {
        kind: 'repository',
        context: 'credit-application',
        token: 'ApplicationListProjection',
      }),
    ),
    { kind: 'domain-event-handler', context: 'credit-application' },
  );

  platform.domainEvents.on(CreditApplicationSubmitted.eventName, async (event) => {
    if (event instanceof CreditApplicationSubmitted) {
      await applicationListOnSubmittedEventHandler.handle(event);
    }
  });

  const declaredConflictsProjection = new DeclaredConflictsProjection(
    platform.adapter(new PrismaDeclaredConflictsStore(platform.persistence.database, platform.scope), {
      kind: 'repository',
      context: 'credit-application',
      token: 'DeclaredConflictsStore',
    }),
  );

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
    requires(SubmitApplicationCommand, creditApplicationPermissions['application.submit'], {
      resource: (command) => ({ type: 'customer', id: command.actor.id }),
    }),
    requires(GiveAccountConsentCommand, creditApplicationPermissions['application.consent'], {
      resource: (command) => ({ type: 'application', id: command.applicationId }),
    }),
    // A search is narrowed by the access scope of the caller, which is its authorization: a permission on the context would refuse every caller.
    publicUseCase(SearchApplicationsQuery),
    requires(NameCoBorrowerCommand, creditApplicationPermissions['application.name-party'], {
      resource: (command) => ({ type: 'application', id: command.applicationId }),
    }),
    requires(NameGuarantorCommand, creditApplicationPermissions['application.name-party'], {
      resource: (command) => ({ type: 'application', id: command.applicationId }),
    }),
    requires(CorrectEntryCommand, creditApplicationPermissions['application.correct'], {
      resource: (command) => ({ type: 'application', id: command.applicationId }),
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
