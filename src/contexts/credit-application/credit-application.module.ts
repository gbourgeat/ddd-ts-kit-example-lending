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
import { GiveAccountConsentCommand } from '@/contexts/credit-application/file/application/commands/give-account-consent/give-account-consent.command';
import { SearchApplicationsHandler } from '@/contexts/credit-application/file/application/queries/search-applications/search-applications.handler';
import { SearchApplicationsQuery } from '@/contexts/credit-application/file/application/queries/search-applications/search-applications.query';
import { PrismaSearchApplicationsReader } from '@/contexts/credit-application/file/infrastructure/persistence/prisma-search-applications.reader';
import { PrismaApplicationListProjection } from '@/contexts/credit-application/file/infrastructure/persistence/prisma-application-list-projection.repository';
import { NameCoBorrowerCommand } from '@/contexts/credit-application/file/application/commands/name-co-borrower/name-co-borrower.command';
import { EventStoreCreditApplicationRepository } from '@/contexts/credit-application/file/infrastructure/persistence/event-store-credit-application.repository';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import { NameGuarantorCommand } from '@/contexts/credit-application/file/application/commands/name-guarantor/name-guarantor.command';
import { CorrectEntryCommand } from '@/contexts/credit-application/file/application/commands/correct-entry/correct-entry.command';
import type { DeclaredConflictsStore } from '@/contexts/credit-application/decision/application/ports/declared-conflicts-store.port';
import { PrismaDeclaredConflictsStore } from '@/contexts/credit-application/decision/infrastructure/persistence/prisma-declared-conflicts-store.repository';
import { registerSubmissionAndConflictsHandlers } from '@/contexts/credit-application/composition/register-submission-and-conflicts-handlers.module';
import { AttachDocumentCommand } from '@/contexts/credit-application/file/application/commands/attach-document/attach-document.command';
import { registerDocumentRetentionHandlers } from '@/contexts/credit-application/composition/register-document-retention-handlers.module';
import { ReadDocumentQuery } from '@/contexts/credit-application/file/application/queries/read-document/read-document.query';
import { registerDecisionReactions } from '@/contexts/credit-application/composition/register-decision-reactions.module';
import { registerAssessmentHandlers } from '@/contexts/credit-application/composition/register-assessment-handlers.module';
import { ReadAccountInformationCommand } from '@/contexts/credit-application/assessment/application/commands/read-account-information/read-account-information.command';
import { ConsultRepaymentIncidentRegisterCommand } from '@/contexts/credit-application/assessment/application/commands/consult-repayment-incident-register/consult-repayment-incident-register.command';
import { SimulatedAccountInformationProvider } from '@/contexts/credit-application/assessment/infrastructure/external/simulated-account-information-provider.adapter';
import { InProcessCustomerIdentityGateway } from '@/contexts/credit-application/assessment/infrastructure/external/in-process-customer-identity.gateway';
import { SimulatedRepaymentIncidentRegister } from '@/contexts/credit-application/assessment/infrastructure/external/simulated-repayment-incident-register.adapter';
import { ErasePersonalDataPastRetentionCommand } from '@/contexts/credit-application/file/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';
import { registerNightlyJobs } from '@/contexts/credit-application/composition/register-nightly-jobs.module';
import { registerFileHandlers } from '@/contexts/credit-application/composition/register-file-handlers.module';
import { PrismaDelegationTables } from '@/contexts/credit-application/decision/infrastructure/persistence/prisma-delegation-tables.repository';
import { registerDelegationTableHandlers } from '@/contexts/credit-application/composition/register-delegation-table-handlers.module';
import { InProcessCustomerDiligenceGateway } from '@/contexts/credit-application/offer/infrastructure/external/in-process-customer-diligence.gateway';
import { PrismaDeciderLevels } from '@/contexts/credit-application/decision/infrastructure/persistence/prisma-decider-levels.repository';
import { registerDeciderLevelHandlers } from '@/contexts/credit-application/composition/register-decider-level-handlers.module';
import { registerDecisionHandlers } from '@/contexts/credit-application/composition/register-decision-handlers.module';
import { registerSubmissionReactions } from '@/contexts/credit-application/composition/register-submission-reactions.module';
import { declareDecisionUseCases } from '@/contexts/credit-application/decision/application/authorization/declare-decision-use-cases.policy';
import { declareFileReferenceUseCases } from '@/contexts/credit-application/file/application/authorization/declare-file-reference-use-cases.policy';
import { declareOfferUseCases } from '@/contexts/credit-application/offer/application/authorization/declare-offer-use-cases.policy';
import { PrismaRateGrids } from '@/contexts/credit-application/offer/infrastructure/persistence/prisma-rate-grids.repository';
import { registerRateGridHandlers } from '@/contexts/credit-application/composition/register-rate-grid-handlers.module';
import { PrismaLegalMaximumRates } from '@/contexts/credit-application/offer/infrastructure/persistence/prisma-legal-maximum-rates.repository';
import { registerLegalMaximumRateHandlers } from '@/contexts/credit-application/composition/register-legal-maximum-rate-handlers.module';
import { AssessApplicationCommand } from '@/contexts/credit-application/assessment/application/commands/assess-application/assess-application.command';
import { InProcessScoringGateway } from '@/contexts/credit-application/assessment/infrastructure/external/in-process-scoring.gateway';
import { PrismaProductTerms } from '@/contexts/credit-application/file/infrastructure/persistence/prisma-product-terms.repository';
import { registerProductTermsHandlers } from '@/contexts/credit-application/composition/register-product-terms-handlers.module';
import { PrismaBrokerRegistrations } from '@/contexts/credit-application/file/infrastructure/persistence/prisma-broker-registrations.repository';
import { registerBrokerRegistrationHandlers } from '@/contexts/credit-application/composition/register-broker-registration-handlers.module';
import { consume, subscribeAll } from '@ddd-ts-kit/events';
import { brokerRegisteredV1, brokerRegistrationLapsedV1 } from '@/contexts/brokerage/published-language';
import { staffMemberAppointedV2 as deciderLevelV2 } from '@/contexts/branch-network/published-language';
import {
  delegationTablePublishedV2 as delegationTableV2,
  legalMaximumRatePublishedV2 as legalMaximumRateV2,
  productDefinedV2,
  rateGridPublishedV2 as rateGridV2,
} from '@/contexts/credit-policy/published-language';
import { KeepBrokerRegistrationIntegrationHandler } from '@/contexts/credit-application/file/application/integration/handlers/keep-broker-registration.integration-handler';
import { KeepBrokerRegistrationLapsedIntegrationHandler } from '@/contexts/credit-application/file/application/integration/handlers/keep-broker-registration-lapsed.integration-handler';
import { KeepProductTermsIntegrationHandler } from '@/contexts/credit-application/file/application/integration/handlers/keep-product-terms.integration-handler';
import { KeepDeciderLevelIntegrationHandler } from '@/contexts/credit-application/decision/application/integration/handlers/keep-decider-level.integration-handler';
import { KeepDelegationTableIntegrationHandler } from '@/contexts/credit-application/decision/application/integration/handlers/keep-delegation-table.integration-handler';
import { KeepLegalMaximumRateIntegrationHandler } from '@/contexts/credit-application/offer/application/integration/handlers/keep-legal-maximum-rate.integration-handler';
import { KeepRateGridIntegrationHandler } from '@/contexts/credit-application/offer/application/integration/handlers/keep-rate-grid.integration-handler';
import { ReviewProposedRefusalCommand } from '@/contexts/credit-application/assessment/application/commands/review-proposed-refusal/review-proposed-refusal.command';
// /ddd-ts-kit:imports

export interface CreditApplicationWiring {
  readonly name: string;
  readonly useCases: readonly UseCaseDeclaration[];
  readonly routes: readonly Route[];
  /** Its Nest controllers, listed by the generated `credit-application.controllers.ts`: Nest builds them, the kit serves their methods. */
  readonly controllers: readonly Type<unknown>[];
}

export function creditApplicationModule(platform: Platform): CreditApplicationWiring {
  const declaredConflicts = readModel(platform, 'DeclaredConflictsStore', PrismaDeclaredConflictsStore);

  const delegationTables = readModel(platform, 'DelegationTables', PrismaDelegationTables);

  const customerAdvisorBranch = registerGateways(platform);

  platform.adapter(new InProcessCustomerDiligenceGateway(platform.customerDiligence), {
    kind: 'gateway',
    context: 'credit-application',
    token: 'CustomerDiligenceGateway',
  });

  const creditApplicationRepository = registerHandlers(platform, declaredConflicts, customerAdvisorBranch);

  registerDelegationTableHandlers(platform, delegationTables);

  const deciderLevels = readModel(platform, 'DeciderLevels', PrismaDeciderLevels);

  registerDeciderLevelHandlers(platform, deciderLevels);
  registerDecisionHandlers(platform, creditApplicationRepository, { deciderLevels, delegationTables });
  registerReactions(platform, declaredConflicts);
  registerJobs(platform);

  return {
    name: 'credit-application',
    useCases: declaredUseCases(),
    routes: routesOf(platform),
    controllers: creditApplicationControllers,
  };
}

/** Binds a read model of the context, built on the database and the scope of the work, to its token. */
function readModel<T extends object>(
  platform: Platform,
  token: string,
  Model: new (database: Platform['persistence']['database'], scope: Platform['scope']) => T,
): T {
  const instance = new Model(platform.persistence.database, platform.scope);

  return platform.adapter(instance, { kind: 'repository', context: 'credit-application', token });
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
): CreditApplicationRepository {
  // ddd-ts-kit:handlers
  const creditApplicationRepository = platform.adapter(
    new EventStoreCreditApplicationRepository(platform.eventSourcing.events, platform.eventSourcing.cipher),
    { kind: 'repository', context: 'credit-application', token: 'CreditApplicationRepository' },
  );

  registerFileHandlers(platform, creditApplicationRepository);

  const searchApplicationsReader = readModel(platform, 'SearchApplicationsReader', PrismaSearchApplicationsReader);

  platform.queries.register(
    SearchApplicationsQuery,
    new SearchApplicationsHandler(searchApplicationsReader, platform.access),
    { context: 'credit-application' },
  );

  registerSubmissionAndConflictsHandlers(platform, {
    repository: creditApplicationRepository,
    declaredConflicts,
    customerAdvisorBranch,
  });

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
    scoring: platform.adapter(new InProcessScoringGateway(platform.scoring), {
      kind: 'gateway',
      context: 'credit-application',
      token: 'ScoringGateway',
    }),
  });

  registerDocumentRetentionHandlers(platform, creditApplicationRepository);

  const rateGrids = readModel(platform, 'RateGrids', PrismaRateGrids);

  registerRateGridHandlers(platform, rateGrids);

  const legalMaximumRates = readModel(platform, 'LegalMaximumRates', PrismaLegalMaximumRates);

  registerLegalMaximumRateHandlers(platform, legalMaximumRates);

  const productTerms = readModel(platform, 'ProductTerms', PrismaProductTerms);

  registerProductTermsHandlers(platform, productTerms, creditApplicationRepository);

  const brokerRegistrations = readModel(platform, 'BrokerRegistrations', PrismaBrokerRegistrations);

  registerBrokerRegistrationHandlers(platform, brokerRegistrations);
  // /ddd-ts-kit:handlers

  return creditApplicationRepository;
}

/** What the context does when an event happens: its own events and those of the other contexts. */
function registerReactions(platform: Platform, declaredConflicts: DeclaredConflictsStore): void {
  // ddd-ts-kit:reactions
  registerSubmissionReactions(
    platform,
    readModel(platform, 'ApplicationListProjection', PrismaApplicationListProjection),
  );

  registerDecisionReactions(platform, declaredConflicts);

  keepReferenceData(platform);

  // /ddd-ts-kit:reactions
}

/** The integration handlers that keep the reference data of the other contexts: each consumer is named here, where the rule reads it. */
function keepReferenceData(platform: Platform): void {
  const { processedEvents: processed, unitOfWork } = platform.persistence;
  const { scope } = platform;

  subscribeAll(platform.subscriberFor('credit-application'), [
    consume(
      delegationTableV2,
      { consumer: 'credit-application.keep-delegation-table', processed, unitOfWork, scope },
      (event) => new KeepDelegationTableIntegrationHandler(platform.commands).handle(event),
    ),
    consume(
      deciderLevelV2,
      { consumer: 'credit-application.keep-decider-level', processed, unitOfWork, scope },
      (event) => new KeepDeciderLevelIntegrationHandler(platform.commands).handle(event),
    ),
    consume(rateGridV2, { consumer: 'credit-application.keep-rate-grid', processed, unitOfWork, scope }, (event) =>
      new KeepRateGridIntegrationHandler(platform.commands).handle(event),
    ),
    consume(
      legalMaximumRateV2,
      { consumer: 'credit-application.keep-legal-maximum-rate', processed, unitOfWork, scope },
      (event) => new KeepLegalMaximumRateIntegrationHandler(platform.commands).handle(event),
    ),
    consume(
      productDefinedV2,
      { consumer: 'credit-application.keep-product-terms', processed, unitOfWork, scope },
      (event) => new KeepProductTermsIntegrationHandler(platform.commands).handle(event),
    ),
    consume(
      brokerRegisteredV1,
      { consumer: 'credit-application.broker-registered', processed, unitOfWork, scope },
      (event) => new KeepBrokerRegistrationIntegrationHandler(platform.commands).handle(event),
    ),
    consume(
      brokerRegistrationLapsedV1,
      { consumer: 'credit-application.broker-registration-lapsed', processed, unitOfWork, scope },
      (event) => new KeepBrokerRegistrationLapsedIntegrationHandler(platform.commands).handle(event),
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
    ...declareOfferUseCases(),
    requires(AssessApplicationCommand, creditApplicationPermissions['application.assess'], {
      resource: () => ({ type: 'context', id: 'credit-application' }),
    }),
    ...declareDecisionUseCases(),
    ...declareFileReferenceUseCases(),
    requires(ReviewProposedRefusalCommand, creditApplicationPermissions['application.review-refusal'], {
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
