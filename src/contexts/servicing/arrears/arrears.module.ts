import type { UseCaseDeclaration } from '@ddd-ts-kit/auth';
import type { Route } from '@ddd-ts-kit/http';
import type { Platform } from '@/platform/composition/platform';
import { CatchUpSubscription, EventSerializer } from '@ddd-ts-kit/kernel';
import { applyingProjection } from '@ddd-ts-kit/kernel/declarations';
// ddd-ts-kit:imports
import { DeclareRepaymentIncidentCommand } from '@/contexts/servicing/arrears/application/commands/declare-repayment-incident/declare-repayment-incident.command';
import { DeclareRepaymentIncidentHandler } from '@/contexts/servicing/arrears/application/commands/declare-repayment-incident/declare-repayment-incident.handler';
import { SimulatedRepaymentIncidentRegister } from '@/contexts/servicing/arrears/infrastructure/external/simulated-repayment-incident-register.adapter';
import { WithdrawRepaymentIncidentCommand } from '@/contexts/servicing/arrears/application/commands/withdraw-repayment-incident/withdraw-repayment-incident.command';
import { WithdrawRepaymentIncidentHandler } from '@/contexts/servicing/arrears/application/commands/withdraw-repayment-incident/withdraw-repayment-incident.handler';
import { ClassifyArrearsCommand } from '@/contexts/servicing/arrears/application/commands/classify-arrears/classify-arrears.command';
import { ClassifyArrearsHandler } from '@/contexts/servicing/arrears/application/commands/classify-arrears/classify-arrears.handler';
import { ClassifyArrearsJob } from '@/contexts/servicing/arrears/application/scheduling/classify-arrears.job';
import { DeclareDefaultCommand } from '@/contexts/servicing/arrears/application/commands/declare-default/declare-default.command';
import { DeclareDefaultHandler } from '@/contexts/servicing/arrears/application/commands/declare-default/declare-default.handler';
import { DeclareDefaultJob } from '@/contexts/servicing/arrears/application/scheduling/declare-default.job';
import { LoanArrearsBucketEnteredPublisher } from '@/contexts/servicing/arrears/application/integration/publishers/loan-arrears-bucket-entered.publisher';
import { LoanArrearsBucketEntered } from '@/contexts/servicing/arrears/domain/events/loan-arrears-bucket-entered.event';
import { LoanDefaultedPublisher } from '@/contexts/servicing/arrears/application/integration/publishers/loan-defaulted.publisher';
import { LoanDefaulted } from '@/contexts/servicing/arrears/domain/events/loan-defaulted.event';
import { requires } from '@ddd-ts-kit/auth';
import { servicingPermissions } from '@/contexts/servicing/servicing.permissions';
import type { LoanRepository } from '@/contexts/servicing/ledger/domain/repositories/loan.repository';
import { DeclareIncidentAfterTwoUnpaidEventHandler } from '@/contexts/servicing/arrears/application/event-handlers/declare-incident-after-two-unpaid.event-handler';
import { LoanInstalmentMarkedUnpaid } from '@/contexts/servicing/instalments/domain/events/loan-instalment-marked-unpaid.event';
import { WithdrawIncidentWhenPaidEventHandler } from '@/contexts/servicing/arrears/application/event-handlers/withdraw-incident-when-paid.event-handler';
import { LoanArrearsCleared } from '@/contexts/servicing/arrears/domain/events/loan-arrears-cleared.event';
import { NotifyBorrowerAtEachStageEventHandler } from '@/contexts/servicing/arrears/application/event-handlers/notify-borrower-at-each-stage.event-handler';
import { SimulatedBorrowerNotifier } from '@/contexts/servicing/arrears/infrastructure/external/simulated-borrower-notifier.adapter';
import { ReadPortfolioAtRiskHandler } from '@/contexts/servicing/arrears/application/queries/read-portfolio-at-risk/read-portfolio-at-risk.handler';
import { ReadPortfolioAtRiskQuery } from '@/contexts/servicing/arrears/application/queries/read-portfolio-at-risk/read-portfolio-at-risk.query';
import { PortfolioAtRiskProjection } from '@/contexts/servicing/arrears/application/projections/portfolio-at-risk.projection';
import { PrismaPortfolioAtRisk } from '@/contexts/servicing/arrears/infrastructure/persistence/prisma-portfolio-at-risk.repository';
import { CatchingUpPortfolioAtRiskReader } from '@/contexts/servicing/arrears/infrastructure/persistence/catching-up-portfolio-at-risk.reader';
import type { LoanEvent } from '@/contexts/servicing/ledger/domain/values/loan-event';
import { loanEvents } from '@/contexts/servicing/ledger/infrastructure/persistence/loan-events.mapper';
// /ddd-ts-kit:imports

/** The subscriber of the portfolio-at-risk projection: the name of its checkpoint. */
const PORTFOLIO_AT_RISK_SUBSCRIBER = 'servicing.portfolio-at-risk';

/** What the module arrears of the model registers; servicing.module.ts composes it with the rest of the context. */
export const arrearsModule = {
  /** The command and query handlers of the module, with the repositories and readers they are given. */
  registerHandlers(platform: Platform, given: { readonly loanRepository: LoanRepository }): void {
    // ddd-ts-kit:handlers
    const { loanRepository } = given;

    const repaymentIncidentRegister = platform.adapter(new SimulatedRepaymentIncidentRegister(), {
      kind: 'external',
      context: 'servicing',
    });

    platform.commands.register(
      DeclareRepaymentIncidentCommand,
      new DeclareRepaymentIncidentHandler(loanRepository, repaymentIncidentRegister, platform.clock),
      { context: 'servicing' },
    );

    platform.commands.register(
      WithdrawRepaymentIncidentCommand,
      new WithdrawRepaymentIncidentHandler(loanRepository, repaymentIncidentRegister, platform.clock),
      { context: 'servicing' },
    );

    platform.commands.register(ClassifyArrearsCommand, new ClassifyArrearsHandler(loanRepository), {
      context: 'servicing',
    });

    platform.commands.register(DeclareDefaultCommand, new DeclareDefaultHandler(loanRepository), {
      context: 'servicing',
    });

    notifyBorrowerAtEachStage(platform, loanRepository);

    platform.queries.register(
      ReadPortfolioAtRiskQuery,
      new ReadPortfolioAtRiskHandler(portfolioAtRiskReaderOf(platform)),
      {
        context: 'servicing',
      },
    );
    // /ddd-ts-kit:handlers
  },

  /** What the module does when an event happens: its own events and those of the other contexts. */
  registerReactions(platform: Platform): void {
    // ddd-ts-kit:reactions
    publishArrearsAndDefaults(platform);
    reactToRepaymentIncidents(platform);
    // /ddd-ts-kit:reactions
  },

  /** The jobs of the module, scheduled and in the background. */
  registerJobs(platform: Platform): void {
    // ddd-ts-kit:jobs
    const classifyArrearsJob = new ClassifyArrearsJob(platform.commands);

    platform.jobs.register({
      name: 'servicing.classify-arrears',
      schedule: { cron: '0 2 * * *', timeZone: 'Europe/Paris' },
      tenancy: 'per-tenant',
      run: (execution) => classifyArrearsJob.run(execution),
    });

    const declareDefaultJob = new DeclareDefaultJob(platform.commands);

    platform.jobs.register({
      name: 'servicing.declare-default',
      schedule: { cron: '0 2 * * *', timeZone: 'Europe/Paris' },
      tenancy: 'per-tenant',
      run: (execution) => declareDefaultJob.run(execution),
    });
    // /ddd-ts-kit:jobs
  },

  /** What each use case of the module requires, or that it is public. */
  useCases(): UseCaseDeclaration[] {
    return [
      // ddd-ts-kit:authorization
      requires(ClassifyArrearsCommand, servicingPermissions['loan.classify-arrears'], {
        resource: () => ({ type: 'context', id: 'servicing' }),
      }),
      requires(DeclareDefaultCommand, servicingPermissions['loan.declare-default'], {
        resource: () => ({ type: 'context', id: 'servicing' }),
      }),
      requires(DeclareRepaymentIncidentCommand, servicingPermissions['loan.declare-incident'], {
        resource: () => ({ type: 'context', id: 'servicing' }),
      }),
      requires(WithdrawRepaymentIncidentCommand, servicingPermissions['loan.withdraw-incident'], {
        resource: () => ({ type: 'context', id: 'servicing' }),
      }),
      requires(ReadPortfolioAtRiskQuery, servicingPermissions['loan.read-portfolio'], {
        resource: () => ({ type: 'context', id: 'servicing' }),
      }),
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

/** The publishers of the arrears bucket entered and of the default, which tell the other contexts what the module decided. */
function publishArrearsAndDefaults(platform: Platform): void {
  const loanArrearsBucketEnteredPublisher = platform.adapter(
    new LoanArrearsBucketEnteredPublisher(platform.publisher, platform.ids),
    { kind: 'domain-event-handler', context: 'servicing' },
  );

  platform.domainEvents.on(LoanArrearsBucketEntered.eventName, async (event) => {
    if (event instanceof LoanArrearsBucketEntered) {
      await loanArrearsBucketEnteredPublisher.handle(event);
    }
  });

  const loanDefaultedPublisher = platform.adapter(new LoanDefaultedPublisher(platform.publisher, platform.ids), {
    kind: 'domain-event-handler',
    context: 'servicing',
  });

  platform.domainEvents.on(LoanDefaulted.eventName, async (event) => {
    if (event instanceof LoanDefaulted) {
      await loanDefaultedPublisher.handle(event);
    }
  });
}

/** The repayment incident is declared after two unpaid instalments and withdrawn once the arrears are cleared. */
function reactToRepaymentIncidents(platform: Platform): void {
  const declareIncidentAfterTwoUnpaidEventHandler = platform.adapter(
    new DeclareIncidentAfterTwoUnpaidEventHandler(platform.commands),
    { kind: 'domain-event-handler', context: 'servicing' },
  );

  platform.domainEvents.on(LoanInstalmentMarkedUnpaid.eventName, async (event) => {
    if (event instanceof LoanInstalmentMarkedUnpaid) {
      await declareIncidentAfterTwoUnpaidEventHandler.handle(event);
    }
  });

  const withdrawIncidentWhenPaidEventHandler = platform.adapter(
    new WithdrawIncidentWhenPaidEventHandler(platform.commands),
    { kind: 'domain-event-handler', context: 'servicing' },
  );

  platform.domainEvents.on(LoanArrearsCleared.eventName, async (event) => {
    if (event instanceof LoanArrearsCleared) {
      await withdrawIncidentWhenPaidEventHandler.handle(event);
    }
  });
}

/** The reaction reads the borrower through the loan repository and tells it by the notifier, once the classification is committed. */
function notifyBorrowerAtEachStage(platform: Platform, loanRepository: LoanRepository): void {
  const borrowerNotifier = platform.adapter(new SimulatedBorrowerNotifier(), {
    kind: 'external',
    context: 'servicing',
  });

  const notifyBorrowerAtEachStageEventHandler = platform.adapter(
    new NotifyBorrowerAtEachStageEventHandler(loanRepository, borrowerNotifier),
    { kind: 'domain-event-handler', context: 'servicing' },
  );

  platform.domainEvents.on(
    LoanArrearsBucketEntered.eventName,
    async (event) => {
      if (event instanceof LoanArrearsBucketEntered) {
        await notifyBorrowerAtEachStageEventHandler.handle(event);
      }
    },
    { phase: 'after-commit' },
  );
}

/** The reader of the portfolio at risk: it catches the projection up with the event store, then answers from the rows of the tenant. */
function portfolioAtRiskReaderOf(platform: Platform): CatchingUpPortfolioAtRiskReader {
  const store = new PrismaPortfolioAtRisk(platform.persistence.database, platform.scope);
  const serializer = new EventSerializer<LoanEvent>(loanEvents, { cipher: platform.eventSourcing.cipher });

  const subscription = new CatchUpSubscription({
    name: PORTFOLIO_AT_RISK_SUBSCRIBER,
    store: platform.eventSourcing.events,
    checkpoints: platform.eventSourcing.checkpoints,
    unitOfWork: platform.persistence.unitOfWork,
    scope: platform.scope,
    apply: applyingProjection(new PortfolioAtRiskProjection(store), serializer),
  });

  return platform.adapter(
    new CatchingUpPortfolioAtRiskReader(subscription, platform.persistence.database, platform.scope),
    { kind: 'repository', context: 'servicing' },
  );
}
