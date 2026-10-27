import type { UseCaseDeclaration } from '@ddd-ts-kit/auth';
import type { Type } from '@nestjs/common';
import { brokerageControllers } from '@/contexts/brokerage/brokerage.controllers';
import type { Route } from '@ddd-ts-kit/http';
import type { Platform } from '@/platform/composition/platform';
// ddd-ts-kit:imports
import { PrismaBrokerRepository } from '@/contexts/brokerage/infrastructure/persistence/prisma-broker.repository';
import { SimulatedIntermediariesRegister } from '@/contexts/brokerage/infrastructure/external/simulated-intermediaries-register.adapter';
import { requires } from '@ddd-ts-kit/auth';
import { brokeragePermissions } from '@/contexts/brokerage/brokerage.permissions';
import { RegisterBrokerCommand } from '@/contexts/brokerage/application/commands/register-broker/register-broker.command';
import { RegisterBrokerHandler } from '@/contexts/brokerage/application/commands/register-broker/register-broker.handler';
import { CheckRegistrationCommand } from '@/contexts/brokerage/application/commands/check-registration/check-registration.command';
import { CheckRegistrationHandler } from '@/contexts/brokerage/application/commands/check-registration/check-registration.handler';
import { CheckRegistrationJob } from '@/contexts/brokerage/application/scheduling/check-registration.job';
import { BrokerRegisteredPublisher } from '@/contexts/brokerage/application/integration/publishers/broker-registered.publisher';
import { BrokerRegistered } from '@/contexts/brokerage/domain/events/broker-registered.event';
import { BrokerRegistrationLapsedPublisher } from '@/contexts/brokerage/application/integration/publishers/broker-registration-lapsed.publisher';
import { BrokerRegistrationLapsed } from '@/contexts/brokerage/domain/events/broker-registration-lapsed.event';
// /ddd-ts-kit:imports

export interface BrokerageWiring {
  readonly name: string;
  readonly useCases: readonly UseCaseDeclaration[];
  readonly routes: readonly Route[];
  /** Its Nest controllers, listed by the generated `brokerage.controllers.ts`: Nest builds them, the kit serves their methods. */
  readonly controllers: readonly Type<unknown>[];
}

export function brokerageModule(platform: Platform): BrokerageWiring {
  registerHandlers(platform);
  registerReactions(platform);
  registerJobs(platform);

  return {
    name: 'brokerage',
    useCases: declaredUseCases(),
    routes: routesOf(platform),
    controllers: brokerageControllers,
  };
}

/** The command and query handlers of the context, with the repositories and readers they are given. */
function registerHandlers(platform: Platform): void {
  // ddd-ts-kit:handlers
  const brokerRepository = platform.adapter(
    new PrismaBrokerRepository(platform.persistence.database, platform.scope, platform.clock),
    { kind: 'repository', context: 'brokerage', token: 'BrokerRepository' },
  );

  const intermediaries = platform.adapter(new SimulatedIntermediariesRegister(), {
    kind: 'external',
    context: 'brokerage',
    token: 'IntermediariesRegister',
  });

  platform.commands.register(
    RegisterBrokerCommand,
    new RegisterBrokerHandler(brokerRepository, intermediaries, platform.ids, platform.clock),
    { context: 'brokerage' },
  );

  platform.commands.register(CheckRegistrationCommand, new CheckRegistrationHandler(brokerRepository, intermediaries), {
    context: 'brokerage',
  });
  // /ddd-ts-kit:handlers
}

/** What the context does when an event happens: its own events and those of the other contexts. */
function registerReactions(platform: Platform): void {
  // ddd-ts-kit:reactions
  const brokerRegisteredPublisher = platform.adapter(new BrokerRegisteredPublisher(platform.publisher, platform.ids), {
    kind: 'domain-event-handler',
    context: 'brokerage',
  });

  platform.domainEvents.on(BrokerRegistered.eventName, async (event) => {
    if (event instanceof BrokerRegistered) {
      await brokerRegisteredPublisher.handle(event);
    }
  });

  const brokerRegistrationLapsedPublisher = platform.adapter(
    new BrokerRegistrationLapsedPublisher(platform.publisher, platform.ids),
    { kind: 'domain-event-handler', context: 'brokerage' },
  );

  platform.domainEvents.on(BrokerRegistrationLapsed.eventName, async (event) => {
    if (event instanceof BrokerRegistrationLapsed) {
      await brokerRegistrationLapsedPublisher.handle(event);
    }
  });
  // /ddd-ts-kit:reactions
}

/** The jobs of the context, scheduled and in the background. */
function registerJobs(platform: Platform): void {
  // ddd-ts-kit:jobs
  const checkRegistrationJob = new CheckRegistrationJob(platform.commands);

  platform.jobs.register({
    name: 'brokerage.check-registration',
    schedule: { cron: '0 6 * * *', timeZone: 'Europe/Paris' },
    tenancy: 'per-tenant',
    run: (execution) => checkRegistrationJob.run(execution),
  });
  // /ddd-ts-kit:jobs
}

/** What each use case requires, or that it is public. */
function declaredUseCases(): UseCaseDeclaration[] {
  return [
    // ddd-ts-kit:authorization
    requires(RegisterBrokerCommand, brokeragePermissions['broker.register'], {
      resource: () => ({ type: 'context', id: 'brokerage' }),
    }),
    requires(CheckRegistrationCommand, brokeragePermissions['broker.check'], {
      resource: () => ({ type: 'context', id: 'brokerage' }),
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
