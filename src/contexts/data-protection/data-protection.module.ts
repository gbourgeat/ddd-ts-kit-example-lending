import type { UseCaseDeclaration } from '@ddd-ts-kit/auth';
import type { Type } from '@nestjs/common';
import { dataProtectionControllers } from '@/contexts/data-protection/data-protection.controllers';
import type { Route } from '@ddd-ts-kit/http';
import type { Platform } from '@/platform/composition/platform';
// ddd-ts-kit:imports
import { CopyOfDataTimeoutBackgroundJob } from '@/contexts/data-protection/application/background/copy-of-data-timeout.background-job';
import { PrismaRetentionPeriodRepository } from '@/contexts/data-protection/infrastructure/persistence/prisma-retention-period.repository';
import { requires } from '@ddd-ts-kit/auth';
import { dataProtectionPermissions } from '@/contexts/data-protection/data-protection.permissions';
import { PlatformPersonalDataPurge } from '@/contexts/data-protection/infrastructure/external/platform-personal-data-purge';
import { runPurge } from '@/platform/privacy/run-purge';
import { ErasePersonalDataPastRetentionCommand } from '@/contexts/data-protection/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';
import { ErasePersonalDataPastRetentionHandler } from '@/contexts/data-protection/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.handler';
import { ErasePersonalDataPastRetentionJob } from '@/contexts/data-protection/application/scheduling/erase-personal-data-past-retention.job';
// /ddd-ts-kit:imports

export interface DataProtectionWiring {
  readonly name: string;
  readonly useCases: readonly UseCaseDeclaration[];
  readonly routes: readonly Route[];
  /** Its Nest controllers, listed by the generated `data-protection.controllers.ts`: Nest builds them, the kit serves their methods. */
  readonly controllers: readonly Type<unknown>[];
}

export function dataProtectionModule(platform: Platform): DataProtectionWiring {
  registerHandlers(platform);
  registerReactions(platform);
  registerJobs(platform);

  return {
    name: 'data-protection',
    useCases: declaredUseCases(),
    routes: routesOf(platform),
    controllers: dataProtectionControllers,
  };
}

/** The command and query handlers of the context, with the repositories and readers they are given. */
function registerHandlers(platform: Platform): void {
  // ddd-ts-kit:handlers
  platform.adapter(new PrismaRetentionPeriodRepository(platform.persistence.database, platform.scope, platform.clock), {
    kind: 'repository',
    context: 'data-protection',
    token: 'RetentionPeriodRepository',
  });

  const personalDataPurge = new PlatformPersonalDataPurge((asOf) => runPurge(platform, asOf));

  platform.commands.register(
    ErasePersonalDataPastRetentionCommand,
    new ErasePersonalDataPastRetentionHandler(personalDataPurge),
    { context: 'data-protection' },
  );
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
  platform.backgroundJobs.register(CopyOfDataTimeoutBackgroundJob, [platform.processes]);

  const erasePersonalDataPastRetentionJob = new ErasePersonalDataPastRetentionJob(platform.commands);

  platform.jobs.register({
    name: 'data-protection.erase-personal-data-past-retention',
    schedule: { cron: '0 3 * * *', timeZone: 'Europe/Paris' },
    tenancy: 'per-tenant',
    run: (execution) => erasePersonalDataPastRetentionJob.run(execution),
  });
  // /ddd-ts-kit:jobs
}

/** What each use case requires, or that it is public. */
function declaredUseCases(): UseCaseDeclaration[] {
  return [
    // ddd-ts-kit:authorization
    requires(ErasePersonalDataPastRetentionCommand, dataProtectionPermissions['data.erase'], {
      resource: () => ({ type: 'context', id: 'data-protection' }),
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
