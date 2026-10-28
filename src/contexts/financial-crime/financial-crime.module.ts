import type { UseCaseDeclaration } from '@ddd-ts-kit/auth';
import type { Type } from '@nestjs/common';
import { financialCrimeControllers } from '@/contexts/financial-crime/financial-crime.controllers';
import type { Route } from '@ddd-ts-kit/http';
import type { Platform } from '@/platform/composition/platform';
// ddd-ts-kit:imports
import { RemoteFinancialIntelligenceUnit } from '@/contexts/financial-crime/infrastructure/external/remote-financial-intelligence-unit.adapter';
import { PrismaAlertRepository } from '@/contexts/financial-crime/infrastructure/persistence/prisma-alert.repository';
import { requires } from '@ddd-ts-kit/auth';
import { financialCrimePermissions } from '@/contexts/financial-crime/financial-crime.permissions';
import { RaiseAlertCommand } from '@/contexts/financial-crime/application/commands/raise-alert/raise-alert.command';
import { RaiseAlertHandler } from '@/contexts/financial-crime/application/commands/raise-alert/raise-alert.handler';
import { CloseAlertCommand } from '@/contexts/financial-crime/application/commands/close-alert/close-alert.command';
import { CloseAlertHandler } from '@/contexts/financial-crime/application/commands/close-alert/close-alert.handler';
import { PrismaSuspiciousActivityReportRepository } from '@/contexts/financial-crime/infrastructure/persistence/prisma-suspicious-activity-report.repository';
import { FileSuspiciousActivityReportCommand } from '@/contexts/financial-crime/application/commands/file-suspicious-activity-report/file-suspicious-activity-report.command';
import { FileSuspiciousActivityReportHandler } from '@/contexts/financial-crime/application/commands/file-suspicious-activity-report/file-suspicious-activity-report.handler';
import { SearchAlertsHandler } from '@/contexts/financial-crime/application/queries/search-alerts/search-alerts.handler';
import { SearchAlertsQuery } from '@/contexts/financial-crime/application/queries/search-alerts/search-alerts.query';
import { PrismaSearchAlertsReader } from '@/contexts/financial-crime/infrastructure/persistence/prisma-search-alerts.reader';
import { GetSuspiciousActivityReportHandler } from '@/contexts/financial-crime/application/queries/get-suspicious-activity-report/get-suspicious-activity-report.handler';
import { GetSuspiciousActivityReportQuery } from '@/contexts/financial-crime/application/queries/get-suspicious-activity-report/get-suspicious-activity-report.query';
import { PrismaGetSuspiciousActivityReportReader } from '@/contexts/financial-crime/infrastructure/persistence/prisma-get-suspicious-activity-report.reader';
// /ddd-ts-kit:imports

export interface FinancialCrimeWiring {
  readonly name: string;
  readonly useCases: readonly UseCaseDeclaration[];
  readonly routes: readonly Route[];
  /** Its Nest controllers, listed by the generated `financial-crime.controllers.ts`: Nest builds them, the kit serves their methods. */
  readonly controllers: readonly Type<unknown>[];
}

export function financialCrimeModule(platform: Platform): FinancialCrimeWiring {
  registerHandlers(platform);
  registerReactions(platform);
  registerJobs(platform);

  return {
    name: 'financial-crime',
    useCases: declaredUseCases(),
    routes: routesOf(platform),
    controllers: financialCrimeControllers,
  };
}

/** The command and query handlers of the context, with the repositories and readers they are given. */
function registerHandlers(platform: Platform): void {
  // ddd-ts-kit:handlers
  const alertRepository = platform.adapter(
    new PrismaAlertRepository(platform.persistence.database, platform.scope, platform.clock),
    { kind: 'repository', context: 'financial-crime', token: 'AlertRepository' },
  );

  platform.commands.register(RaiseAlertCommand, new RaiseAlertHandler(alertRepository, platform.ids, platform.clock), {
    context: 'financial-crime',
  });

  platform.commands.register(CloseAlertCommand, new CloseAlertHandler(alertRepository, platform.clock), {
    context: 'financial-crime',
  });

  const suspiciousActivityReportRepository = platform.adapter(
    new PrismaSuspiciousActivityReportRepository(platform.persistence.database, platform.scope, platform.clock),
    { kind: 'repository', context: 'financial-crime', token: 'SuspiciousActivityReportRepository' },
  );

  const financialIntelligenceUnit = platform.adapter(new RemoteFinancialIntelligenceUnit(), {
    kind: 'external',
    context: 'financial-crime',
    token: 'FinancialIntelligenceUnit',
  });

  platform.commands.register(
    FileSuspiciousActivityReportCommand,
    new FileSuspiciousActivityReportHandler(
      suspiciousActivityReportRepository,
      financialIntelligenceUnit,
      platform.ids,
      platform.clock,
    ),
    { context: 'financial-crime' },
  );

  const searchAlertsReader = platform.adapter(
    new PrismaSearchAlertsReader(platform.persistence.database, platform.scope),
    {
      kind: 'repository',
      context: 'financial-crime',
    },
  );

  platform.queries.register(SearchAlertsQuery, new SearchAlertsHandler(searchAlertsReader, platform.access), {
    context: 'financial-crime',
  });

  const getSuspiciousActivityReportReader = platform.adapter(
    new PrismaGetSuspiciousActivityReportReader(platform.persistence.database, platform.scope),
    {
      kind: 'repository',
      context: 'financial-crime',
    },
  );

  platform.queries.register(
    GetSuspiciousActivityReportQuery,
    new GetSuspiciousActivityReportHandler(getSuspiciousActivityReportReader, platform.access),
    { context: 'financial-crime' },
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
  // /ddd-ts-kit:jobs
}

/** What each use case requires, or that it is public. */
function declaredUseCases(): UseCaseDeclaration[] {
  return [
    // ddd-ts-kit:authorization
    requires(RaiseAlertCommand, financialCrimePermissions['alert.raise'], {
      resource: () => ({ type: 'context', id: 'financial-crime' }),
    }),
    requires(CloseAlertCommand, financialCrimePermissions['alert.close'], {
      resource: () => ({ type: 'context', id: 'financial-crime' }),
    }),
    requires(FileSuspiciousActivityReportCommand, financialCrimePermissions['report.file'], {
      resource: () => ({ type: 'context', id: 'financial-crime' }),
    }),
    requires(SearchAlertsQuery, financialCrimePermissions['alert.read'], {
      resource: () => ({ type: 'context', id: 'financial-crime' }),
    }),
    requires(GetSuspiciousActivityReportQuery, financialCrimePermissions['report.read'], {
      resource: () => ({ type: 'context', id: 'financial-crime' }),
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
