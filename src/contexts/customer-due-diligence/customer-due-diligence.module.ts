import type { UseCaseDeclaration } from '@ddd-ts-kit/auth';
import type { Type } from '@nestjs/common';
import { customerDueDiligenceControllers } from '@/contexts/customer-due-diligence/customer-due-diligence.controllers';
import type { Route } from '@ddd-ts-kit/http';
import type { Platform } from '@/platform/composition/platform';
// ddd-ts-kit:imports
import { CustomerIdentifiedPublisher } from '@/contexts/customer-due-diligence/application/integration/publishers/customer-identified.publisher';
import { CustomerIdentified } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';
import { EventStoreCustomerRepository } from '@/contexts/customer-due-diligence/infrastructure/persistence/event-store-customer.repository';
import { requires } from '@ddd-ts-kit/auth';
import { customerDueDiligencePermissions } from '@/contexts/customer-due-diligence/customer-due-diligence.permissions';
import { RegisterBusinessCommand } from '@/contexts/customer-due-diligence/application/commands/register-business/register-business.command';
import { RegisterBusinessHandler } from '@/contexts/customer-due-diligence/application/commands/register-business/register-business.handler';
import { IdentifyCustomerCommand } from '@/contexts/customer-due-diligence/application/commands/identify-customer/identify-customer.command';
import { IdentifyCustomerHandler } from '@/contexts/customer-due-diligence/application/commands/identify-customer/identify-customer.handler';
// /ddd-ts-kit:imports

export interface CustomerDueDiligenceWiring {
  readonly name: string;
  readonly useCases: readonly UseCaseDeclaration[];
  readonly routes: readonly Route[];
  /** Its Nest controllers, listed by the generated `customer-due-diligence.controllers.ts`: Nest builds them, the kit serves their methods. */
  readonly controllers: readonly Type<unknown>[];
}

export function customerDueDiligenceModule(platform: Platform): CustomerDueDiligenceWiring {
  registerHandlers(platform);
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
function registerHandlers(platform: Platform): void {
  // ddd-ts-kit:handlers
  const customerRepository = platform.adapter(
    new EventStoreCustomerRepository(platform.eventSourcing.events, platform.eventSourcing.cipher),
    { kind: 'repository', context: 'customer-due-diligence', token: 'CustomerRepository' },
  );

  platform.commands.register(RegisterBusinessCommand, new RegisterBusinessHandler(customerRepository, platform.clock), {
    context: 'customer-due-diligence',
  });

  platform.commands.register(
    IdentifyCustomerCommand,
    new IdentifyCustomerHandler(customerRepository, platform.ids, platform.clock),
    { context: 'customer-due-diligence' },
  );
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
