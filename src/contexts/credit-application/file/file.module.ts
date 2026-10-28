import type { UseCaseDeclaration } from '@ddd-ts-kit/auth';
import type { Route } from '@ddd-ts-kit/http';
import type { Platform } from '@/platform/composition/platform';
// ddd-ts-kit:imports
import { publicUseCase, requires } from '@ddd-ts-kit/auth';
import { consume, subscribeAll } from '@ddd-ts-kit/events';
import { brokerRegisteredV1, brokerRegistrationLapsedV1 } from '@/contexts/brokerage/published-language';
import { productDefinedV2 } from '@/contexts/credit-policy/published-language';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { declareFileReferenceUseCases } from '@/contexts/credit-application/file/application/authorization/declare-file-reference-use-cases.policy';
import { AttachDocumentCommand } from '@/contexts/credit-application/file/application/commands/attach-document/attach-document.command';
import { AttachDocumentHandler } from '@/contexts/credit-application/file/application/commands/attach-document/attach-document.handler';
import { BringApplicationCommand } from '@/contexts/credit-application/file/application/commands/bring-application/bring-application.command';
import { BringApplicationHandler } from '@/contexts/credit-application/file/application/commands/bring-application/bring-application.handler';
import { CheckRequestAgainstProductCommand } from '@/contexts/credit-application/file/application/commands/check-request-against-product/check-request-against-product.command';
import { CheckRequestAgainstProductHandler } from '@/contexts/credit-application/file/application/commands/check-request-against-product/check-request-against-product.handler';
import { CorrectEntryCommand } from '@/contexts/credit-application/file/application/commands/correct-entry/correct-entry.command';
import { CorrectEntryHandler } from '@/contexts/credit-application/file/application/commands/correct-entry/correct-entry.handler';
import { ErasePersonalDataPastRetentionCommand } from '@/contexts/credit-application/file/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';
import { ErasePersonalDataPastRetentionHandler } from '@/contexts/credit-application/file/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.handler';
import { GiveAccountConsentCommand } from '@/contexts/credit-application/file/application/commands/give-account-consent/give-account-consent.command';
import { GiveAccountConsentHandler } from '@/contexts/credit-application/file/application/commands/give-account-consent/give-account-consent.handler';
import { KeepBrokerRegistrationCommand } from '@/contexts/credit-application/file/application/commands/keep-broker-registration/keep-broker-registration.command';
import { KeepBrokerRegistrationHandler } from '@/contexts/credit-application/file/application/commands/keep-broker-registration/keep-broker-registration.handler';
import { KeepProductTermsCommand } from '@/contexts/credit-application/file/application/commands/keep-product-terms/keep-product-terms.command';
import { KeepProductTermsHandler } from '@/contexts/credit-application/file/application/commands/keep-product-terms/keep-product-terms.handler';
import { NameCoBorrowerCommand } from '@/contexts/credit-application/file/application/commands/name-co-borrower/name-co-borrower.command';
import { NameCoBorrowerHandler } from '@/contexts/credit-application/file/application/commands/name-co-borrower/name-co-borrower.handler';
import { NameGuarantorCommand } from '@/contexts/credit-application/file/application/commands/name-guarantor/name-guarantor.command';
import { NameGuarantorHandler } from '@/contexts/credit-application/file/application/commands/name-guarantor/name-guarantor.handler';
import { SubmitApplicationCommand } from '@/contexts/credit-application/file/application/commands/submit-application/submit-application.command';
import { SubmitApplicationHandler } from '@/contexts/credit-application/file/application/commands/submit-application/submit-application.handler';
import { ApplicationListOnSubmittedEventHandler } from '@/contexts/credit-application/file/application/event-handlers/application-list-on-submitted.event-handler';
import { CheckRequestAgainstProductEventHandler } from '@/contexts/credit-application/file/application/event-handlers/check-request-against-product.event-handler';
import { KeepBrokerRegistrationIntegrationHandler } from '@/contexts/credit-application/file/application/integration/handlers/keep-broker-registration.integration-handler';
import { KeepBrokerRegistrationLapsedIntegrationHandler } from '@/contexts/credit-application/file/application/integration/handlers/keep-broker-registration-lapsed.integration-handler';
import { KeepProductTermsIntegrationHandler } from '@/contexts/credit-application/file/application/integration/handlers/keep-product-terms.integration-handler';
import { CreditApplicationSubmittedPublisher } from '@/contexts/credit-application/file/application/integration/publishers/credit-application-submitted.publisher';
import type { ApplicationListProjection } from '@/contexts/credit-application/file/application/ports/application-list-projection.port';
import type { BrokerRegistrations } from '@/contexts/credit-application/file/application/ports/broker-registrations.port';
import type { CustomerAdvisorBranchGateway } from '@/contexts/credit-application/file/application/ports/customer-advisor-branch-gateway.port';
import type { ProductTerms } from '@/contexts/credit-application/file/application/ports/product-terms.port';
import { ReadBrokerRegistrationHandler } from '@/contexts/credit-application/file/application/queries/read-broker-registration/read-broker-registration.handler';
import { ReadBrokerRegistrationQuery } from '@/contexts/credit-application/file/application/queries/read-broker-registration/read-broker-registration.query';
import { ReadDocumentHandler } from '@/contexts/credit-application/file/application/queries/read-document/read-document.handler';
import { ReadDocumentQuery } from '@/contexts/credit-application/file/application/queries/read-document/read-document.query';
import { ReadProductTermsHandler } from '@/contexts/credit-application/file/application/queries/read-product-terms/read-product-terms.handler';
import { ReadProductTermsQuery } from '@/contexts/credit-application/file/application/queries/read-product-terms/read-product-terms.query';
import { ReadProductTermsFindingsHandler } from '@/contexts/credit-application/file/application/queries/read-product-terms-findings/read-product-terms-findings.handler';
import { ReadProductTermsFindingsQuery } from '@/contexts/credit-application/file/application/queries/read-product-terms-findings/read-product-terms-findings.query';
import { SearchApplicationsHandler } from '@/contexts/credit-application/file/application/queries/search-applications/search-applications.handler';
import { SearchApplicationsQuery } from '@/contexts/credit-application/file/application/queries/search-applications/search-applications.query';
import { ErasePersonalDataPastRetentionJob } from '@/contexts/credit-application/file/application/scheduling/erase-personal-data-past-retention.job';
import { CreditApplicationSubmitted } from '@/contexts/credit-application/file/domain/events/credit-application-submitted.event';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import { InProcessCustomerAdvisorBranchGateway } from '@/contexts/credit-application/file/infrastructure/external/in-process-customer-advisor-branch.gateway';
import { PrismaApplicationListProjection } from '@/contexts/credit-application/file/infrastructure/persistence/prisma-application-list-projection.repository';
import { PrismaBrokerRegistrations } from '@/contexts/credit-application/file/infrastructure/persistence/prisma-broker-registrations.repository';
import { PrismaProductTerms } from '@/contexts/credit-application/file/infrastructure/persistence/prisma-product-terms.repository';
import { PrismaSearchApplicationsReader } from '@/contexts/credit-application/file/infrastructure/persistence/prisma-search-applications.reader';
// /ddd-ts-kit:imports

/** What the module file of the model registers; credit-application.module.ts composes it with the rest of the context. */
export const fileModule = {
  /** The command and query handlers of the module, with the repositories and readers they are given. */
  registerHandlers(platform: Platform, given: { readonly repository: CreditApplicationRepository }): void {
    // ddd-ts-kit:handlers
    const { repository } = given;
    const brokerRegistrations = readModel(platform, 'BrokerRegistrations', PrismaBrokerRegistrations);

    registerApplicationFileHandlers(platform, repository);
    registerSubmissionHandlers(platform, repository, brokerRegistrations);
    registerSearchApplications(platform);
    registerDocumentRetentionHandlers(platform, repository);
    registerProductTermsHandlers(platform, repository);
    registerBrokerRegistrationHandlers(platform, brokerRegistrations);
    // /ddd-ts-kit:handlers
  },

  /** What the module does when an event happens: its own events and those of the other contexts. */
  registerReactions(platform: Platform): void {
    // ddd-ts-kit:reactions
    registerSubmissionReactions(
      platform,
      readModel(platform, 'ApplicationListProjection', PrismaApplicationListProjection),
    );

    keepReferenceData(platform);
    // /ddd-ts-kit:reactions
  },

  /** The jobs of the module, scheduled and in the background. */
  registerJobs(platform: Platform): void {
    // ddd-ts-kit:jobs
    registerNightlyJobs(platform);
    // /ddd-ts-kit:jobs
  },

  /** What each use case of the module requires, or that it is public. */
  useCases(): UseCaseDeclaration[] {
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
      ...documentUseCases(),
      ...declareFileReferenceUseCases(),
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

/** What the use cases on the documents of an application and on the retention of its personal data require. */
function documentUseCases(): UseCaseDeclaration[] {
  return [
    requires(AttachDocumentCommand, creditApplicationPermissions['application.attach-document'], {
      resource: (command) => ({ type: 'application', id: command.applicationId }),
    }),
    requires(ReadDocumentQuery, creditApplicationPermissions['application.read'], {
      resource: (query) => ({ type: 'application', id: query.applicationId }),
    }),
    requires(ErasePersonalDataPastRetentionCommand, creditApplicationPermissions['application.erase-past-retention'], {
      resource: () => ({ type: 'context', id: 'credit-application' }),
    }),
  ];
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

/** The commands of the file module that act on the application file alone. */
function registerApplicationFileHandlers(platform: Platform, repository: CreditApplicationRepository): void {
  platform.commands.register(GiveAccountConsentCommand, new GiveAccountConsentHandler(repository, platform.clock), {
    context: 'credit-application',
  });

  platform.commands.register(NameCoBorrowerCommand, new NameCoBorrowerHandler(repository, platform.clock), {
    context: 'credit-application',
  });

  platform.commands.register(NameGuarantorCommand, new NameGuarantorHandler(repository, platform.clock), {
    context: 'credit-application',
  });

  platform.commands.register(CorrectEntryCommand, new CorrectEntryHandler(repository, platform.clock), {
    context: 'credit-application',
  });

  platform.commands.register(
    AttachDocumentCommand,
    new AttachDocumentHandler(repository, platform.clock, platform.files.staging),
    { context: 'credit-application' },
  );
}

/** The submission of an application, brought or not; the branch of an advisor is answered by branch-network, bound by the platform. */
function registerSubmissionHandlers(
  platform: Platform,
  repository: CreditApplicationRepository,
  brokerRegistrations: BrokerRegistrations,
): void {
  const customerAdvisorBranch: CustomerAdvisorBranchGateway = platform.adapter(
    new InProcessCustomerAdvisorBranchGateway(platform.customerAdvisorBranch),
    { kind: 'external', context: 'credit-application', token: 'CustomerAdvisorBranchGateway' },
  );

  platform.commands.register(
    SubmitApplicationCommand,
    new SubmitApplicationHandler(repository, platform.ids, platform.clock, customerAdvisorBranch),
    { context: 'credit-application' },
  );

  platform.commands.register(
    BringApplicationCommand,
    new BringApplicationHandler(repository, platform.ids, platform.clock, customerAdvisorBranch, brokerRegistrations),
    { context: 'credit-application' },
  );
}

function registerSearchApplications(platform: Platform): void {
  const reader = readModel(platform, 'SearchApplicationsReader', PrismaSearchApplicationsReader);

  platform.queries.register(SearchApplicationsQuery, new SearchApplicationsHandler(reader, platform.access), {
    context: 'credit-application',
  });
}

/** The query that reads the document of an application, and the command that erases the personal data past retention. */
function registerDocumentRetentionHandlers(platform: Platform, repository: CreditApplicationRepository): void {
  platform.queries.register(ReadDocumentQuery, new ReadDocumentHandler(repository, platform.files.storage), {
    context: 'credit-application',
  });

  platform.commands.register(
    ErasePersonalDataPastRetentionCommand,
    new ErasePersonalDataPastRetentionHandler(repository, platform.files.storage),
    {
      context: 'credit-application',
    },
  );
}

/** The product terms (kept and read), the check of a request against them and the findings it leaves, over the read model the module binds. */
function registerProductTermsHandlers(platform: Platform, repository: CreditApplicationRepository): void {
  const productTerms = readModel(platform, 'ProductTerms', PrismaProductTerms);

  registerCheckRequestAgainstProduct(platform, repository, productTerms);

  platform.queries.register(ReadProductTermsFindingsQuery, new ReadProductTermsFindingsHandler(repository), {
    context: 'credit-application',
  });

  platform.commands.register(KeepProductTermsCommand, new KeepProductTermsHandler(productTerms), {
    context: 'credit-application',
  });

  platform.queries.register(ReadProductTermsQuery, new ReadProductTermsHandler(productTerms), {
    context: 'credit-application',
  });
}

/** The check of a submitted application against its product: the command, and the reaction to the submission that runs it. */
function registerCheckRequestAgainstProduct(
  platform: Platform,
  repository: CreditApplicationRepository,
  productTerms: ProductTerms,
): void {
  const check = new CheckRequestAgainstProductHandler(repository, productTerms, platform.clock);

  platform.commands.register(CheckRequestAgainstProductCommand, check, { context: 'credit-application' });

  const checkOnSubmitted = platform.adapter(new CheckRequestAgainstProductEventHandler(check), {
    kind: 'domain-event-handler',
    context: 'credit-application',
  });

  platform.domainEvents.on(CreditApplicationSubmitted.eventName, async (event) => {
    if (event instanceof CreditApplicationSubmitted) {
      await checkOnSubmitted.handle(event);
    }
  });
}

/** The command that keeps the broker registrations and the query that reads them, over the read model the module binds. */
function registerBrokerRegistrationHandlers(platform: Platform, brokerRegistrations: BrokerRegistrations): void {
  const keep = new KeepBrokerRegistrationHandler(brokerRegistrations, platform.relations);

  platform.commands.register(KeepBrokerRegistrationCommand, keep, { context: 'credit-application' });

  platform.queries.register(ReadBrokerRegistrationQuery, new ReadBrokerRegistrationHandler(brokerRegistrations), {
    context: 'credit-application',
  });
}

/** What the context does when an application is submitted: it is announced to the other contexts and listed. */
function registerSubmissionReactions(platform: Platform, applicationList: ApplicationListProjection): void {
  const submittedPublisher = platform.adapter(
    new CreditApplicationSubmittedPublisher(platform.publisher, platform.ids),
    {
      kind: 'domain-event-handler',
      context: 'credit-application',
    },
  );

  platform.domainEvents.on(CreditApplicationSubmitted.eventName, async (event) => {
    if (event instanceof CreditApplicationSubmitted) {
      await submittedPublisher.handle(event);
    }
  });

  const listOnSubmitted = platform.adapter(new ApplicationListOnSubmittedEventHandler(applicationList), {
    kind: 'domain-event-handler',
    context: 'credit-application',
  });

  platform.domainEvents.on(CreditApplicationSubmitted.eventName, async (event) => {
    if (event instanceof CreditApplicationSubmitted) {
      await listOnSubmitted.handle(event);
    }
  });
}

/** The integration handlers that keep the product terms and the broker registrations: each consumer is named here, where the rule reads it. */
function keepReferenceData(platform: Platform): void {
  const { processedEvents: processed, unitOfWork } = platform.persistence;
  const { scope } = platform;

  subscribeAll(platform.subscriberFor('credit-application'), [
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

/** The nightly jobs of the module, run per bank: the personal data of refused applications erased past retention. */
function registerNightlyJobs(platform: Platform): void {
  const erasePersonalDataPastRetentionJob = new ErasePersonalDataPastRetentionJob(platform.commands);

  platform.jobs.register({
    name: 'credit-application.erase-personal-data-past-retention',
    schedule: { cron: '30 3 * * *', timeZone: 'Europe/Paris' },
    tenancy: 'per-tenant',
    run: (execution) => erasePersonalDataPastRetentionJob.run(execution),
  });
}
