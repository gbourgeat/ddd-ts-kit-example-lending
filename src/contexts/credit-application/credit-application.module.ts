import type { UseCaseDeclaration } from '@ddd-ts-kit/auth';
import type { Type } from '@nestjs/common';
import { creditApplicationControllers } from '@/contexts/credit-application/credit-application.controllers';
import type { Route } from '@ddd-ts-kit/http';
import type { Platform } from '@/platform/composition/platform';
import { InProcessCustomerAdvisorBranchGateway } from '@/contexts/credit-application/file/infrastructure/external/in-process-customer-advisor-branch.gateway';
import type { CustomerAdvisorBranchGateway } from '@/contexts/credit-application/file/application/ports/customer-advisor-branch-gateway.port';
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
import type { DeclaredConflictsStore } from '@/contexts/credit-application/decision/application/ports/declared-conflicts-store.port';
import { PrismaDeclaredConflictsStore } from '@/contexts/credit-application/decision/infrastructure/persistence/prisma-declared-conflicts-store.repository';
import { ReadDeclaredConflictsHandler } from '@/contexts/credit-application/decision/application/queries/read-declared-conflicts/read-declared-conflicts.handler';
import { ReadDeclaredConflictsQuery } from '@/contexts/credit-application/decision/application/queries/read-declared-conflicts/read-declared-conflicts.query';
import { AttachDocumentCommand } from '@/contexts/credit-application/file/application/commands/attach-document/attach-document.command';
import { AttachDocumentHandler } from '@/contexts/credit-application/file/application/commands/attach-document/attach-document.handler';
import { ReadDocumentHandler } from '@/contexts/credit-application/file/application/queries/read-document/read-document.handler';
import { ReadDocumentQuery } from '@/contexts/credit-application/file/application/queries/read-document/read-document.query';
import { registerDecisionReactions } from '@/contexts/credit-application/composition/register-decision-reactions.module';
import { registerOfferReactions } from '@/contexts/credit-application/composition/register-offer-reactions.module';
import { consume, subscribeAll } from '@ddd-ts-kit/events';
import { staffMemberAppointedV2 as deciderLevelDefinition } from '@/contexts/branch-network/published-language';
import {
  delegationTablePublishedV2 as delegationTableDefinition,
  legalMaximumRatePublishedV2 as legalMaximumRateDefinition,
  rateGridPublishedV2 as rateGridDefinition,
} from '@/contexts/credit-policy/published-language';
import { KeepDeciderLevelIntegrationHandler } from '@/contexts/credit-application/decision/application/integration/handlers/keep-decider-level.integration-handler';
import { KeepDelegationTableIntegrationHandler } from '@/contexts/credit-application/decision/application/integration/handlers/keep-delegation-table.integration-handler';
import { KeepLegalMaximumRateIntegrationHandler } from '@/contexts/credit-application/offer/application/integration/handlers/keep-legal-maximum-rate.integration-handler';
import { KeepRateGridIntegrationHandler } from '@/contexts/credit-application/offer/application/integration/handlers/keep-rate-grid.integration-handler';
import { registerAssessmentHandlers } from '@/contexts/credit-application/composition/register-assessment-handlers.module';
import { ReadAccountInformationCommand } from '@/contexts/credit-application/assessment/application/commands/read-account-information/read-account-information.command';
import { ConsultRepaymentIncidentRegisterCommand } from '@/contexts/credit-application/assessment/application/commands/consult-repayment-incident-register/consult-repayment-incident-register.command';
import { SimulatedAccountInformationProvider } from '@/contexts/credit-application/assessment/infrastructure/external/simulated-account-information-provider.adapter';
import { InProcessCustomerIdentityGateway } from '@/contexts/credit-application/assessment/infrastructure/external/in-process-customer-identity.gateway';
import { SimulatedRepaymentIncidentRegister } from '@/contexts/credit-application/assessment/infrastructure/external/simulated-repayment-incident-register.adapter';
import { EventStoreCreditApplicationRepository } from '@/contexts/credit-application/file/infrastructure/persistence/event-store-credit-application.repository';
import { ErasePersonalDataPastRetentionCommand } from '@/contexts/credit-application/file/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';
import { ErasePersonalDataPastRetentionHandler } from '@/contexts/credit-application/file/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.handler';
import { registerNightlyJobs } from '@/contexts/credit-application/composition/register-nightly-jobs.module';
// /ddd-ts-kit:imports

export interface CreditApplicationWiring {
  readonly name: string;
  readonly useCases: readonly UseCaseDeclaration[];
  readonly routes: readonly Route[];
  /** Its Nest controllers, listed by the generated `credit-application.controllers.ts`: Nest builds them, the kit serves their methods. */
  readonly controllers: readonly Type<unknown>[];
}

export function creditApplicationModule(platform: Platform): CreditApplicationWiring {
  const declaredConflicts = platform.adapter(
    new PrismaDeclaredConflictsStore(platform.persistence.database, platform.scope),
    {
      kind: 'repository',
      context: 'credit-application',
      token: 'DeclaredConflictsStore',
    },
  );

  const customerAdvisorBranch = registerGateways(platform);

  registerHandlers(platform, declaredConflicts, customerAdvisorBranch);
  registerReactions(platform, declaredConflicts);
  registerJobs(platform);

  return {
    name: 'credit-application',
    useCases: declaredUseCases(),
    routes: routesOf(platform),
    controllers: creditApplicationControllers,
  };
}

/** The gateways to the other contexts: the branch of an advisor is answered by branch-network, bound by the platform. */
function registerGateways(platform: Platform): CustomerAdvisorBranchGateway {
  return platform.adapter(new InProcessCustomerAdvisorBranchGateway(platform.customerAdvisorBranch), {
    kind: 'external',
    context: 'credit-application',
    token: 'CustomerAdvisorBranchGateway',
  });
}

/** The command and query handlers of the context, with the repositories and readers they are given. */
function registerHandlers(
  platform: Platform,
  declaredConflicts: DeclaredConflictsStore,
  customerAdvisorBranch: CustomerAdvisorBranchGateway,
): void {
  // ddd-ts-kit:handlers
  const creditApplicationRepository = platform.adapter(
    new EventStoreCreditApplicationRepository(platform.eventSourcing.events, platform.eventSourcing.cipher),
    { kind: 'repository', context: 'credit-application', token: 'CreditApplicationRepository' },
  );

  platform.commands.register(
    SubmitApplicationCommand,
    new SubmitApplicationHandler(creditApplicationRepository, platform.ids, platform.clock, customerAdvisorBranch),
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

  platform.queries.register(
    ReadDeclaredConflictsQuery,
    new ReadDeclaredConflictsHandler(declaredConflicts, creditApplicationRepository),
    {
      context: 'credit-application',
    },
  );

  platform.commands.register(
    AttachDocumentCommand,
    new AttachDocumentHandler(creditApplicationRepository, platform.clock, platform.files.staging),
    {
      context: 'credit-application',
    },
  );

  registerAssessmentHandlers(platform, {
    repository: creditApplicationRepository,
    accounts: platform.adapter(new SimulatedAccountInformationProvider(), {
      kind: 'external',
      context: 'credit-application',
      token: 'AccountInformationProvider',
    }),
    identities: platform.adapter(new InProcessCustomerIdentityGateway(platform.customerIdentity), {
      kind: 'gateway',
      context: 'credit-application',
      token: 'CustomerIdentityGateway',
    }),
    register: platform.adapter(new SimulatedRepaymentIncidentRegister(), {
      kind: 'external',
      context: 'credit-application',
      token: 'RepaymentIncidentRegister',
    }),
  });

  platform.queries.register(
    ReadDocumentQuery,
    new ReadDocumentHandler(creditApplicationRepository, platform.files.storage),
    { context: 'credit-application' },
  );

  platform.commands.register(
    ErasePersonalDataPastRetentionCommand,
    new ErasePersonalDataPastRetentionHandler(creditApplicationRepository, platform.ids, platform.clock),
    { context: 'credit-application' },
  );
  // /ddd-ts-kit:handlers
}

/** What the context does when an event happens: its own events and those of the other contexts. */
function registerReactions(platform: Platform, declaredConflicts: DeclaredConflictsStore): void {
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

  registerDecisionReactions(platform, declaredConflicts);

  registerOfferReactions(platform);
  keepReferenceData(platform);
  // /ddd-ts-kit:reactions
}

/** The integration handlers that keep the reference data of credit-policy and the level of each decider. */
function keepReferenceData(platform: Platform): void {
  const keepDelegationTableIntegrationHandler = new KeepDelegationTableIntegrationHandler(platform.commands);
  const keepDeciderLevelIntegrationHandler = new KeepDeciderLevelIntegrationHandler(platform.commands);
  const keepRateGridIntegrationHandler = new KeepRateGridIntegrationHandler(platform.commands);
  const keepLegalMaximumRateIntegrationHandler = new KeepLegalMaximumRateIntegrationHandler(platform.commands);
  const { processedEvents: processed, unitOfWork } = platform.persistence;
  const { scope } = platform;

  subscribeAll(platform.subscriberFor('credit-application'), [
    consume(
      delegationTableDefinition,
      { consumer: 'credit-application.keep-delegation-table', processed, unitOfWork, scope },
      (event) => keepDelegationTableIntegrationHandler.handle(event),
    ),
    consume(
      deciderLevelDefinition,
      { consumer: 'credit-application.keep-decider-level', processed, unitOfWork, scope },
      (event) => keepDeciderLevelIntegrationHandler.handle(event),
    ),
    consume(
      rateGridDefinition,
      { consumer: 'credit-application.keep-rate-grid', processed, unitOfWork, scope },
      (event) => keepRateGridIntegrationHandler.handle(event),
    ),
    consume(
      legalMaximumRateDefinition,
      { consumer: 'credit-application.keep-legal-maximum-rate', processed, unitOfWork, scope },
      (event) => keepLegalMaximumRateIntegrationHandler.handle(event),
    ),
  ]);
}

/** The jobs of the context, scheduled and in the background. */
function registerJobs(platform: Platform): void {
  // ddd-ts-kit:jobs
  registerNightlyJobs(platform);
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
    requires(ReadDeclaredConflictsQuery, creditApplicationPermissions['application.decide'], {
      resource: () => ({ type: 'context', id: 'credit-application' }),
    }),
    requires(AttachDocumentCommand, creditApplicationPermissions['application.attach-document'], {
      resource: (command) => ({ type: 'application', id: command.applicationId }),
    }),
    requires(ReadAccountInformationCommand, creditApplicationPermissions['application.read-accounts'], {
      resource: (command) => ({ type: 'application', id: command.applicationId }),
    }),
    requires(ConsultRepaymentIncidentRegisterCommand, creditApplicationPermissions['application.consult-register'], {
      resource: () => ({ type: 'context', id: 'credit-application' }),
    }),
    requires(ReadDocumentQuery, creditApplicationPermissions['application.read'], {
      resource: (query) => ({ type: 'application', id: query.applicationId }),
    }),
    requires(ErasePersonalDataPastRetentionCommand, creditApplicationPermissions['application.erase-past-retention'], {
      resource: () => ({ type: 'context', id: 'credit-application' }),
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
