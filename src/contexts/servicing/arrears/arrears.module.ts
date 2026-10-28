import type { UseCaseDeclaration } from '@ddd-ts-kit/auth';
import type { Route } from '@ddd-ts-kit/http';
import type { Platform } from '@/platform/composition/platform';
// ddd-ts-kit:imports
import { DeclareRepaymentIncidentCommand } from '@/contexts/servicing/arrears/application/commands/declare-repayment-incident/declare-repayment-incident.command';
import { DeclareRepaymentIncidentHandler } from '@/contexts/servicing/arrears/application/commands/declare-repayment-incident/declare-repayment-incident.handler';
import { SimulatedRepaymentIncidentRegister } from '@/contexts/servicing/arrears/infrastructure/external/simulated-repayment-incident-register.adapter';
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
// /ddd-ts-kit:imports

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

    platform.commands.register(ClassifyArrearsCommand, new ClassifyArrearsHandler(loanRepository), {
      context: 'servicing',
    });

    platform.commands.register(DeclareDefaultCommand, new DeclareDefaultHandler(loanRepository), {
      context: 'servicing',
    });
    // /ddd-ts-kit:handlers
  },

  /** What the module does when an event happens: its own events and those of the other contexts. */
  registerReactions(platform: Platform): void {
    // ddd-ts-kit:reactions
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

    const declareIncidentAfterTwoUnpaidEventHandler = platform.adapter(
      new DeclareIncidentAfterTwoUnpaidEventHandler(platform.commands),
      { kind: 'domain-event-handler', context: 'servicing' },
    );

    platform.domainEvents.on(LoanInstalmentMarkedUnpaid.eventName, async (event) => {
      if (event instanceof LoanInstalmentMarkedUnpaid) {
        await declareIncidentAfterTwoUnpaidEventHandler.handle(event);
      }
    });
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
