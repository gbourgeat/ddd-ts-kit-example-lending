import type { UseCaseDeclaration } from '@ddd-ts-kit/auth';
import type { Type } from '@nestjs/common';
import { dataProtectionControllers } from '@/contexts/data-protection/data-protection.controllers';
import type { Route } from '@ddd-ts-kit/http';
import type { Platform } from '@/platform/composition/platform';
// ddd-ts-kit:imports
import { CopyOfDataTimeoutBackgroundJob } from '@/contexts/data-protection/application/background/copy-of-data-timeout.background-job';
import { PrismaRetentionPeriodRepository } from '@/contexts/data-protection/infrastructure/persistence/prisma-retention-period.repository';
import { publicUseCase, requires } from '@ddd-ts-kit/auth';
import { dataProtectionPermissions } from '@/contexts/data-protection/data-protection.permissions';
import { PlatformPersonalDataPurge } from '@/contexts/data-protection/infrastructure/external/platform-personal-data-purge';
import { runPurge } from '@/platform/privacy/run-purge';
import { ErasePersonalDataPastRetentionCommand } from '@/contexts/data-protection/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';
import { ErasePersonalDataPastRetentionHandler } from '@/contexts/data-protection/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.handler';
import { ErasePersonalDataPastRetentionJob } from '@/contexts/data-protection/application/scheduling/erase-personal-data-past-retention.job';
import { RequestPersonalDataCopyCommand } from '@/contexts/data-protection/application/commands/request-personal-data-copy/request-personal-data-copy.command';
import { RequestPersonalDataCopyHandler } from '@/contexts/data-protection/application/commands/request-personal-data-copy/request-personal-data-copy.handler';
import { PlatformPersonalDataGathering } from '@/contexts/data-protection/infrastructure/external/platform-personal-data-gathering';
import { FileCopyOfDataStore } from '@/contexts/data-protection/infrastructure/external/file-copy-of-data-store';
import { runExport } from '@/platform/privacy/run-export';
import { tenantDirectory } from '@/platform/composition/tenant-directory';

import { RequestPersonalDataCopyLinkCommand } from '@/contexts/data-protection/application/commands/request-personal-data-copy-link/request-personal-data-copy-link.command';
import { RequestPersonalDataCopyLinkHandler } from '@/contexts/data-protection/application/commands/request-personal-data-copy-link/request-personal-data-copy-link.handler';
import { PrismaImpactAssessmentRepository } from '@/contexts/data-protection/infrastructure/persistence/prisma-impact-assessment.repository';
import { RecordScoringImpactAssessmentCommand } from '@/contexts/data-protection/application/commands/record-scoring-impact-assessment/record-scoring-impact-assessment.command';
import { RecordScoringImpactAssessmentHandler } from '@/contexts/data-protection/application/commands/record-scoring-impact-assessment/record-scoring-impact-assessment.handler';
import { controllerRoutes } from '@ddd-ts-kit/http';
import { RecordScoringImpactAssessmentController } from '@/contexts/data-protection/presentation/http/impact-assessments/record-scoring-impact-assessment/record-scoring-impact-assessment.controller';
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

  const gathering = new PlatformPersonalDataGathering((subject, operator) =>
    gatherPersonalData(platform, subject, operator),
  );

  const copies = new FileCopyOfDataStore(platform.files.storage, platform.ids);

  platform.commands.register(
    RequestPersonalDataCopyCommand,
    new RequestPersonalDataCopyHandler(platform.access, gathering, copies),
    { context: 'data-protection' },
  );

  platform.commands.register(
    RequestPersonalDataCopyLinkCommand,
    new RequestPersonalDataCopyLinkHandler(platform.access, copies, platform.clock),
    { context: 'data-protection' },
  );

  const impactAssessmentRepository = platform.adapter(
    new PrismaImpactAssessmentRepository(platform.persistence.database, platform.scope, platform.clock),
    { kind: 'repository', context: 'data-protection', token: 'ImpactAssessmentRepository' },
  );

  platform.commands.register(
    RecordScoringImpactAssessmentCommand,
    new RecordScoringImpactAssessmentHandler(impactAssessmentRepository, platform.clock),
    { context: 'data-protection' },
  );
  // /ddd-ts-kit:handlers
}

/** The export of every context's records of a subject, in every tenant the directory lists: none is refused, a copy of nothing is not a copy. */
async function gatherPersonalData(platform: Platform, subject: string, operator: string) {
  const tenants = await tenantDirectory(platform.persistence).tenants();

  if (tenants.length === 0) {
    throw new Error('The tenant directory lists no tenant: no copy can be gathered');
  }

  return runExport(subject, { platform, operator, correlationId: platform.ids.next(), tenants });
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
    // The handler asks the customer's self, then the operator of the context: the guard admits every signed-in caller.
    publicUseCase(RequestPersonalDataCopyCommand),
    publicUseCase(RequestPersonalDataCopyLinkCommand),
    requires(RecordScoringImpactAssessmentCommand, dataProtectionPermissions['impact-assessment.record'], {
      resource: () => ({ type: 'context', id: 'data-protection' }),
    }),
    // /ddd-ts-kit:authorization
  ];
}

/** The routes the context answers, over the buses of the platform. */
function routesOf(platform: Platform): Route[] {
  return [
    // ddd-ts-kit:routes
    ...controllerRoutes([new RecordScoringImpactAssessmentController(platform.commands)]),
    // /ddd-ts-kit:routes
  ];
}
