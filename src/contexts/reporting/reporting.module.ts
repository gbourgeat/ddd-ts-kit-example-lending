import type { UseCaseDeclaration } from '@ddd-ts-kit/auth';
import type { Type } from '@nestjs/common';
import { reportingControllers } from '@/contexts/reporting/reporting.controllers';
import type { Route } from '@ddd-ts-kit/http';
import type { Platform } from '@/platform/composition/platform';
// ddd-ts-kit:imports
import { consume, subscribeAll } from '@ddd-ts-kit/events';
import {
  creditApplicationDecidedV1 as decisionDefinition,
  creditApplicationSubmittedV2 as applicationCountDefinition,
  creditApplicationPayoutAuthorisedV1 as loanPrincipalDefinition,
} from '@/contexts/credit-application/published-language';
import { ApplicationCountProjection } from '@/contexts/reporting/application/projections/application-count.projection';
import { PrismaApplicationCounts } from '@/contexts/reporting/infrastructure/persistence/prisma-application-counts.repository';
import { DecisionProjection } from '@/contexts/reporting/application/projections/decision.projection';
import { PrismaDecisionCounts } from '@/contexts/reporting/infrastructure/persistence/prisma-decision-counts.repository';
import {
  loanArrearsBucketEnteredV1 as portfolioAtRiskDefinition,
  loanDefaultedV1 as defaultedLoanDefinition,
} from '@/contexts/servicing/published-language';
import { PortfolioAtRiskProjection } from '@/contexts/reporting/application/projections/portfolio-at-risk.projection';
import { LoanPrincipalProjection } from '@/contexts/reporting/application/projections/loan-principal.projection';
import { PrismaPortfolioAtRisk } from '@/contexts/reporting/infrastructure/persistence/prisma-portfolio-at-risk.repository';
import { PrismaLoanPrincipal } from '@/contexts/reporting/infrastructure/persistence/prisma-loan-principal.repository';
import { requires } from '@ddd-ts-kit/auth';
import { reportingPermissions } from '@/contexts/reporting/reporting.permissions';
import { PortfolioAtRiskPerBranchHandler } from '@/contexts/reporting/application/queries/portfolio-at-risk-per-branch/portfolio-at-risk-per-branch.handler';
import { PortfolioAtRiskPerBranchQuery } from '@/contexts/reporting/application/queries/portfolio-at-risk-per-branch/portfolio-at-risk-per-branch.query';
import { PrismaPortfolioAtRiskPerBranchReader } from '@/contexts/reporting/infrastructure/persistence/prisma-portfolio-at-risk-per-branch.reader';
import { DefaultedLoanProjection } from '@/contexts/reporting/application/projections/defaulted-loan.projection';
import { DefaultedLoansHandler } from '@/contexts/reporting/application/queries/defaulted-loans/defaulted-loans.handler';
import { DefaultedLoansQuery } from '@/contexts/reporting/application/queries/defaulted-loans/defaulted-loans.query';
import { PrismaDefaultedLoan } from '@/contexts/reporting/infrastructure/persistence/prisma-defaulted-loan.repository';
import { PrismaDefaultedLoansReader } from '@/contexts/reporting/infrastructure/persistence/prisma-defaulted-loans.reader';
// /ddd-ts-kit:imports

export interface ReportingWiring {
  readonly name: string;
  readonly useCases: readonly UseCaseDeclaration[];
  readonly routes: readonly Route[];
  /** Its Nest controllers, listed by the generated `reporting.controllers.ts`: Nest builds them, the kit serves their methods. */
  readonly controllers: readonly Type<unknown>[];
}

export function reportingModule(platform: Platform): ReportingWiring {
  registerHandlers(platform);
  registerReactions(platform);
  registerJobs(platform);

  return {
    name: 'reporting',
    useCases: declaredUseCases(),
    routes: routesOf(platform),
    controllers: reportingControllers,
  };
}

/** The command and query handlers of the context, with the repositories and readers they are given. */
function registerHandlers(platform: Platform): void {
  // ddd-ts-kit:handlers
  const portfolioAtRiskPerBranchReader = platform.adapter(
    new PrismaPortfolioAtRiskPerBranchReader(platform.persistence.database, platform.scope),
    { kind: 'repository', context: 'reporting' },
  );

  platform.queries.register(
    PortfolioAtRiskPerBranchQuery,
    new PortfolioAtRiskPerBranchHandler(portfolioAtRiskPerBranchReader),
    { context: 'reporting' },
  );

  const defaultedLoansReader = platform.adapter(
    new PrismaDefaultedLoansReader(platform.persistence.database, platform.scope),
    { kind: 'repository', context: 'reporting' },
  );

  platform.queries.register(DefaultedLoansQuery, new DefaultedLoansHandler(defaultedLoansReader), {
    context: 'reporting',
  });
  // /ddd-ts-kit:handlers
}

/** What the context does when an event happens: its own events and those of the other contexts. */
function registerReactions(platform: Platform): void {
  // ddd-ts-kit:reactions
  const applicationCounts = new PrismaApplicationCounts(platform.persistence.database, platform.scope);
  const applicationCountProjection = new ApplicationCountProjection(applicationCounts);

  subscribeAll(platform.subscriberFor('reporting'), [
    consume(
      applicationCountDefinition,
      {
        consumer: 'reporting.application-count',
        processed: platform.persistence.processedEvents,
        unitOfWork: platform.persistence.unitOfWork,
        scope: platform.scope,
      },
      async (event) => {
        await applicationCountProjection.submitted(event);
      },
    ),
  ]);

  const decisionCounts = new PrismaDecisionCounts(platform.persistence.database, platform.scope);
  const decisionProjection = new DecisionProjection(decisionCounts);

  subscribeAll(platform.subscriberFor('reporting'), [
    consume(
      decisionDefinition,
      {
        consumer: 'reporting.decision',
        processed: platform.persistence.processedEvents,
        unitOfWork: platform.persistence.unitOfWork,
        scope: platform.scope,
      },
      async (event) => {
        await decisionProjection.decided(event);
      },
    ),
  ]);

  const portfolioAtRisk = new PrismaPortfolioAtRisk(platform.persistence.database, platform.scope);
  const portfolioAtRiskProjection = new PortfolioAtRiskProjection(portfolioAtRisk);

  subscribeAll(platform.subscriberFor('reporting'), [
    consume(
      portfolioAtRiskDefinition,
      {
        consumer: 'reporting.portfolio-at-risk',
        processed: platform.persistence.processedEvents,
        unitOfWork: platform.persistence.unitOfWork,
        scope: platform.scope,
      },
      async (event) => {
        await portfolioAtRiskProjection.arrearsBucketEntered(event);
      },
    ),
  ]);

  const loanPrincipal = new PrismaLoanPrincipal(platform.persistence.database, platform.scope);
  const loanPrincipalProjection = new LoanPrincipalProjection(loanPrincipal);

  subscribeAll(platform.subscriberFor('reporting'), [
    consume(
      loanPrincipalDefinition,
      {
        consumer: 'reporting.loan-principal',
        processed: platform.persistence.processedEvents,
        unitOfWork: platform.persistence.unitOfWork,
        scope: platform.scope,
      },
      async (event) => {
        await loanPrincipalProjection.payoutAuthorised(event);
      },
    ),
  ]);

  const defaultedLoans = new PrismaDefaultedLoan(platform.persistence.database, platform.scope);
  const defaultedLoanProjection = new DefaultedLoanProjection(defaultedLoans);

  subscribeAll(platform.subscriberFor('reporting'), [
    consume(
      defaultedLoanDefinition,
      {
        consumer: 'reporting.defaulted-loan',
        processed: platform.persistence.processedEvents,
        unitOfWork: platform.persistence.unitOfWork,
        scope: platform.scope,
      },
      async (event) => {
        await defaultedLoanProjection.defaulted(event);
      },
    ),
  ]);
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
    requires(PortfolioAtRiskPerBranchQuery, reportingPermissions['report.portfolio-at-risk'], {
      resource: () => ({ type: 'context', id: 'reporting' }),
    }),
    requires(DefaultedLoansQuery, reportingPermissions['report.defaults'], {
      resource: () => ({ type: 'context', id: 'reporting' }),
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
