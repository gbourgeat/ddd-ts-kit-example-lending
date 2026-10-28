import type { UseCaseDeclaration } from '@ddd-ts-kit/auth';
import type { Type } from '@nestjs/common';
import { customerDueDiligenceControllers } from '@/contexts/customer-due-diligence/customer-due-diligence.controllers';
import type { Route } from '@ddd-ts-kit/http';
import type { Platform } from '@/platform/composition/platform';
import type { ScreeningProvider } from '@/contexts/customer-due-diligence/application/ports/screening-provider.port';
// ddd-ts-kit:imports
import { SimulatedScreeningProvider } from '@/contexts/customer-due-diligence/infrastructure/external/simulated-screening-provider.adapter';
import { CustomerIdentifiedPublisher } from '@/contexts/customer-due-diligence/application/integration/publishers/customer-identified.publisher';
import { CustomerIdentified } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';
import { EventStoreCustomerRepository } from '@/contexts/customer-due-diligence/infrastructure/persistence/event-store-customer.repository';
import { requires } from '@ddd-ts-kit/auth';
import { customerDueDiligencePermissions } from '@/contexts/customer-due-diligence/customer-due-diligence.permissions';
import { RegisterBusinessCommand } from '@/contexts/customer-due-diligence/application/commands/register-business/register-business.command';
import { RegisterBusinessHandler } from '@/contexts/customer-due-diligence/application/commands/register-business/register-business.handler';
import { IdentifyCustomerCommand } from '@/contexts/customer-due-diligence/application/commands/identify-customer/identify-customer.command';
import { IdentifyCustomerHandler } from '@/contexts/customer-due-diligence/application/commands/identify-customer/identify-customer.handler';
import { DeclareDirectorsAndOwnersCommand } from '@/contexts/customer-due-diligence/application/commands/declare-directors-and-owners/declare-directors-and-owners.command';
import { DeclareDirectorsAndOwnersHandler } from '@/contexts/customer-due-diligence/application/commands/declare-directors-and-owners/declare-directors-and-owners.handler';
import { GetCustomerFileHandler } from '@/contexts/customer-due-diligence/application/queries/get-customer-file/get-customer-file.handler';
import { GetCustomerFileQuery } from '@/contexts/customer-due-diligence/application/queries/get-customer-file/get-customer-file.query';
import { PrismaGetCustomerFileReader } from '@/contexts/customer-due-diligence/infrastructure/persistence/prisma-get-customer-file.reader';
import { PrismaCustomerFileProjectionRepository } from '@/contexts/customer-due-diligence/infrastructure/persistence/prisma-customer-file-projection.repository';
import { CustomerFileOnIdentifiedEventHandler } from '@/contexts/customer-due-diligence/application/event-handlers/customer-file-on-identified.event-handler';
import { AssignAdvisorCommand } from '@/contexts/customer-due-diligence/application/commands/assign-advisor/assign-advisor.command';
import { AssignAdvisorHandler } from '@/contexts/customer-due-diligence/application/commands/assign-advisor/assign-advisor.handler';
import { ScreenCustomerCommand } from '@/contexts/customer-due-diligence/application/commands/screen-customer/screen-customer.command';
import { ScreenCustomerHandler } from '@/contexts/customer-due-diligence/application/commands/screen-customer/screen-customer.handler';
import { CustomerAdvisorAssignedPublisher } from '@/contexts/customer-due-diligence/application/integration/publishers/customer-advisor-assigned.publisher';
import { CustomerAdvisorAssigned } from '@/contexts/customer-due-diligence/domain/events/customer-advisor-assigned.event';
import { ConfirmSanctionsMatchCommand } from '@/contexts/customer-due-diligence/application/commands/confirm-sanctions-match/confirm-sanctions-match.command';
import { ConfirmSanctionsMatchHandler } from '@/contexts/customer-due-diligence/application/commands/confirm-sanctions-match/confirm-sanctions-match.handler';
import { EndRelationshipCommand } from '@/contexts/customer-due-diligence/application/commands/end-relationship/end-relationship.command';
import { EndRelationshipHandler } from '@/contexts/customer-due-diligence/application/commands/end-relationship/end-relationship.handler';
import { EndRelationshipOnSanctionsMatchEventHandler } from '@/contexts/customer-due-diligence/application/event-handlers/end-relationship-on-sanctions-match.event-handler';
import { CustomerSanctionsMatchConfirmed } from '@/contexts/customer-due-diligence/domain/events/customer-sanctions-match-confirmed.event';
import { DismissMatchCommand } from '@/contexts/customer-due-diligence/application/commands/dismiss-match/dismiss-match.command';
import { DismissMatchHandler } from '@/contexts/customer-due-diligence/application/commands/dismiss-match/dismiss-match.handler';
// /ddd-ts-kit:imports

export interface CustomerDueDiligenceWiring {
  readonly name: string;
  readonly useCases: readonly UseCaseDeclaration[];
  readonly routes: readonly Route[];
  /** Its Nest controllers, listed by the generated `customer-due-diligence.controllers.ts`: Nest builds them, the kit serves their methods. */
  readonly controllers: readonly Type<unknown>[];
}

/** The screening provider is the simulated one unless the composition gives another (the tests feed the records they arrange). */
export function customerDueDiligenceModule(
  platform: Platform,
  screening: ScreeningProvider = new SimulatedScreeningProvider(),
): CustomerDueDiligenceWiring {
  registerHandlers(platform, screening);
  registerReactions(platform);
  registerJobs(platform);

  return {
    name: 'customer-due-diligence',
    useCases: declaredUseCases(),
    routes: routesOf(platform),
    controllers: customerDueDiligenceControllers,
  };
}

/** The command and query handlers of the context, with the repositories and readers they are given. */
function registerHandlers(platform: Platform, screening: ScreeningProvider): void {
  // ddd-ts-kit:handlers
  const customerRepository = platform.adapter(
    new EventStoreCustomerRepository(platform.eventSourcing.events, platform.eventSourcing.cipher),
    { kind: 'repository', context: 'customer-due-diligence', token: 'CustomerRepository' },
  );

  platform.commands.register(RegisterBusinessCommand, new RegisterBusinessHandler(customerRepository, platform.clock), {
    context: 'customer-due-diligence',
  });

  const screeningProvider = platform.adapter(screening, {
    kind: 'external',
    context: 'customer-due-diligence',
    token: 'ScreeningProvider',
  });

  platform.commands.register(
    IdentifyCustomerCommand,
    new IdentifyCustomerHandler(customerRepository, platform.ids, platform.clock, screeningProvider),
    { context: 'customer-due-diligence' },
  );

  platform.commands.register(
    DeclareDirectorsAndOwnersCommand,
    new DeclareDirectorsAndOwnersHandler(customerRepository, platform.clock),
    { context: 'customer-due-diligence' },
  );

  const getCustomerFileReader = platform.adapter(
    new PrismaGetCustomerFileReader(platform.persistence.database, platform.scope),
    {
      kind: 'repository',
      context: 'customer-due-diligence',
    },
  );

  platform.queries.register(GetCustomerFileQuery, new GetCustomerFileHandler(getCustomerFileReader, platform.access), {
    context: 'customer-due-diligence',
  });

  platform.commands.register(AssignAdvisorCommand, new AssignAdvisorHandler(customerRepository, platform.clock), {
    context: 'customer-due-diligence',
  });

  platform.commands.register(
    ScreenCustomerCommand,
    new ScreenCustomerHandler(customerRepository, screeningProvider, platform.clock),
    { context: 'customer-due-diligence' },
  );

  platform.commands.register(
    ConfirmSanctionsMatchCommand,
    new ConfirmSanctionsMatchHandler(customerRepository, platform.clock),
    { context: 'customer-due-diligence' },
  );

  platform.commands.register(EndRelationshipCommand, new EndRelationshipHandler(customerRepository, platform.clock), {
    context: 'customer-due-diligence',
  });

  platform.commands.register(DismissMatchCommand, new DismissMatchHandler(customerRepository, platform.clock), {
    context: 'customer-due-diligence',
  });
  // /ddd-ts-kit:handlers
}

/** What the context does when an event happens: its own events and those of the other contexts. */
function registerReactions(platform: Platform): void {
  // ddd-ts-kit:reactions
  const customerIdentifiedPublisher = platform.adapter(
    new CustomerIdentifiedPublisher(platform.publisher, platform.ids),
    { kind: 'domain-event-handler', context: 'customer-due-diligence' },
  );

  platform.domainEvents.on(CustomerIdentified.eventName, async (event) => {
    if (event instanceof CustomerIdentified) {
      await customerIdentifiedPublisher.handle(event);
    }
  });

  const customerFileOnIdentifiedEventHandler = platform.adapter(
    new CustomerFileOnIdentifiedEventHandler(
      platform.adapter(new PrismaCustomerFileProjectionRepository(platform.persistence.database, platform.scope), {
        kind: 'repository',
        context: 'customer-due-diligence',
        token: 'CustomerFileProjection',
      }),
    ),
    {
      kind: 'domain-event-handler',
      context: 'customer-due-diligence',
    },
  );

  platform.domainEvents.on(CustomerIdentified.eventName, async (event) => {
    if (event instanceof CustomerIdentified) {
      await customerFileOnIdentifiedEventHandler.handle(event);
    }
  });

  const customerAdvisorAssignedPublisher = platform.adapter(
    new CustomerAdvisorAssignedPublisher(platform.publisher, platform.ids),
    { kind: 'domain-event-handler', context: 'customer-due-diligence' },
  );

  platform.domainEvents.on(CustomerAdvisorAssigned.eventName, async (event) => {
    if (event instanceof CustomerAdvisorAssigned) {
      await customerAdvisorAssignedPublisher.handle(event);
    }
  });

  const endRelationshipOnSanctionsMatchEventHandler = platform.adapter(
    new EndRelationshipOnSanctionsMatchEventHandler(platform.commands),
    { kind: 'domain-event-handler', context: 'customer-due-diligence' },
  );

  platform.domainEvents.on(CustomerSanctionsMatchConfirmed.eventName, async (event) => {
    if (event instanceof CustomerSanctionsMatchConfirmed) {
      await endRelationshipOnSanctionsMatchEventHandler.handle(event);
    }
  });
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
    requires(RegisterBusinessCommand, customerDueDiligencePermissions['business.register'], {
      resource: () => ({ type: 'context', id: 'customer-due-diligence' }),
    }),
    requires(IdentifyCustomerCommand, customerDueDiligencePermissions['customer.identify'], {
      resource: () => ({ type: 'context', id: 'customer-due-diligence' }),
    }),
    requires(DeclareDirectorsAndOwnersCommand, customerDueDiligencePermissions['business.declare-owners'], {
      resource: () => ({ type: 'context', id: 'customer-due-diligence' }),
    }),
    requires(GetCustomerFileQuery, customerDueDiligencePermissions['customer.read'], {
      resource: () => ({ type: 'context', id: 'customer-due-diligence' }),
    }),
    requires(AssignAdvisorCommand, customerDueDiligencePermissions['customer.assign-advisor'], {
      resource: () => ({ type: 'context', id: 'customer-due-diligence' }),
    }),
    requires(ScreenCustomerCommand, customerDueDiligencePermissions['customer.screen'], {
      resource: () => ({ type: 'context', id: 'customer-due-diligence' }),
    }),
    requires(ConfirmSanctionsMatchCommand, customerDueDiligencePermissions['match.confirm'], {
      resource: () => ({ type: 'context', id: 'customer-due-diligence' }),
    }),
    requires(EndRelationshipCommand, customerDueDiligencePermissions['relationship.end'], {
      resource: () => ({ type: 'context', id: 'customer-due-diligence' }),
    }),
    requires(DismissMatchCommand, customerDueDiligencePermissions['match.dismiss'], {
      resource: () => ({ type: 'context', id: 'customer-due-diligence' }),
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
