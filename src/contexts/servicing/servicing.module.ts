import type { UseCaseDeclaration } from '@ddd-ts-kit/auth';
import type { Type } from '@nestjs/common';
import { servicingControllers } from '@/contexts/servicing/servicing.controllers';
import type { Route } from '@ddd-ts-kit/http';
import type { Platform } from '@/platform/composition/platform';
// ddd-ts-kit:imports
import { EventStoreLoanRepository } from '@/contexts/servicing/ledger/infrastructure/persistence/event-store-loan.repository';
import { requires } from '@ddd-ts-kit/auth';
import { servicingPermissions } from '@/contexts/servicing/servicing.permissions';
import { ErasePersonalDataPastRetentionCommand } from '@/contexts/servicing/ledger/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';
import { ErasePersonalDataPastRetentionHandler } from '@/contexts/servicing/ledger/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.handler';
import { ErasePersonalDataPastRetentionJob } from '@/contexts/servicing/ledger/application/scheduling/erase-personal-data-past-retention.job';
// /ddd-ts-kit:imports

export interface ServicingWiring {
  readonly name: string;
  readonly useCases: readonly UseCaseDeclaration[];
  readonly routes: readonly Route[];
  /** Its Nest controllers, listed by the generated `servicing.controllers.ts`: Nest builds them, the kit serves their methods. */
  readonly controllers: readonly Type<unknown>[];
}

export function servicingModule(platform: Platform): ServicingWiring {
  registerHandlers(platform);
  registerReactions(platform);
  registerJobs(platform);

  return {
    name: 'servicing',
    useCases: declaredUseCases(),
    routes: routesOf(platform),
    controllers: servicingControllers,
  };
}

/** The command and query handlers of the context, with the repositories and readers they are given. */
function registerHandlers(platform: Platform): void {
  // ddd-ts-kit:handlers
  platform.adapter(new EventStoreLoanRepository(platform.eventSourcing.events, platform.eventSourcing.cipher), {
    kind: 'repository',
    context: 'servicing',
    token: 'LoanRepository',
  });

  platform.commands.register(ErasePersonalDataPastRetentionCommand, new ErasePersonalDataPastRetentionHandler(), {
    context: 'servicing',
  });
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
  const erasePersonalDataPastRetentionJob = new ErasePersonalDataPastRetentionJob(platform.commands);

  platform.jobs.register({
    name: 'servicing.erase-personal-data-past-retention',
    schedule: { cron: '0 4 * * *', timeZone: 'Europe/Paris' },
    tenancy: 'per-tenant',
    run: (execution) => erasePersonalDataPastRetentionJob.run(execution),
  });
  // /ddd-ts-kit:jobs
}

/** What each use case requires, or that it is public. */
function declaredUseCases(): UseCaseDeclaration[] {
  return [
    // ddd-ts-kit:authorization
    requires(ErasePersonalDataPastRetentionCommand, servicingPermissions['loan.erase-past-retention'], {
      resource: () => ({ type: 'context', id: 'servicing' }),
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
