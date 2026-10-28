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
import { RemotePersonalDataErasure } from '@/contexts/servicing/ledger/infrastructure/external/remote-personal-data-erasure.adapter';
import { CloseLoanCommand } from '@/contexts/servicing/ledger/application/commands/close-loan/close-loan.command';
import { CloseLoanHandler } from '@/contexts/servicing/ledger/application/commands/close-loan/close-loan.handler';
import { consume, subscribeAll } from '@ddd-ts-kit/events';
import {
  creditApplicationPayoutAuthorisedV1 as recordPayoutOnPayoutAuthorisedDefinition,
  creditApplicationRescheduleDecidedV1 as rescheduleOnDecisionDefinition,
  creditApplicationWithdrawnV1 as repayWithdrawnLoanDefinition,
} from '@/contexts/credit-application/published-language';
import { RecordPayoutOnPayoutAuthorisedIntegrationHandler } from '@/contexts/servicing/ledger/application/integration/handlers/record-payout-on-payout-authorised.integration-handler';
import { RecordPayoutCommand } from '@/contexts/servicing/ledger/application/commands/record-payout/record-payout.command';
import { RecordPayoutHandler } from '@/contexts/servicing/ledger/application/commands/record-payout/record-payout.handler';
import { ReadLoanHandler } from '@/contexts/servicing/ledger/application/queries/read-loan/read-loan.handler';
import { ReadLoanQuery } from '@/contexts/servicing/ledger/application/queries/read-loan/read-loan.query';
import { EventStoreReadLoanReader } from '@/contexts/servicing/ledger/infrastructure/persistence/event-store-read-loan.reader';
import { RemoteBorrowerIdentity } from '@/contexts/servicing/ledger/infrastructure/external/remote-borrower-identity.adapter';
import { ComputeDueInstalmentsCommand } from '@/contexts/servicing/instalments/application/commands/compute-due-instalments/compute-due-instalments.command';
import { ComputeDueInstalmentsHandler } from '@/contexts/servicing/instalments/application/commands/compute-due-instalments/compute-due-instalments.handler';
import { ComputeDueInstalmentsJob } from '@/contexts/servicing/instalments/application/scheduling/compute-due-instalments.job';
import { LoanPaidOutPublisher } from '@/contexts/servicing/ledger/application/integration/publishers/loan-paid-out.publisher';
import { LoanPaidOut } from '@/contexts/servicing/ledger/domain/events/loan-paid-out.event';
import { RepayEarlyCommand } from '@/contexts/servicing/ledger/application/commands/repay-early/repay-early.command';
import { RepayEarlyHandler } from '@/contexts/servicing/ledger/application/commands/repay-early/repay-early.handler';
import { WriteOffLoanCommand } from '@/contexts/servicing/ledger/application/commands/write-off-loan/write-off-loan.command';
import { WriteOffLoanHandler } from '@/contexts/servicing/ledger/application/commands/write-off-loan/write-off-loan.handler';
import { ReverseWriteOffCommand } from '@/contexts/servicing/ledger/application/commands/reverse-write-off/reverse-write-off.command';
import { ReverseWriteOffHandler } from '@/contexts/servicing/ledger/application/commands/reverse-write-off/reverse-write-off.handler';
import { RescheduleOnDecisionIntegrationHandler } from '@/contexts/servicing/ledger/application/integration/handlers/reschedule-on-decision.integration-handler';
import { RescheduleLoanCommand } from '@/contexts/servicing/ledger/application/commands/reschedule-loan/reschedule-loan.command';
import { RescheduleLoanHandler } from '@/contexts/servicing/ledger/application/commands/reschedule-loan/reschedule-loan.handler';
import { RepayWithdrawnLoanIntegrationHandler } from '@/contexts/servicing/ledger/application/integration/handlers/repay-withdrawn-loan.integration-handler';
import { RecordWithdrawalRepaymentCommand } from '@/contexts/servicing/ledger/application/commands/record-withdrawal-repayment/record-withdrawal-repayment.command';
import { RecordWithdrawalRepaymentHandler } from '@/contexts/servicing/ledger/application/commands/record-withdrawal-repayment/record-withdrawal-repayment.handler';
import { CollectInstalmentCommand } from '@/contexts/servicing/instalments/application/commands/collect-instalment/collect-instalment.command';
import { CollectInstalmentHandler } from '@/contexts/servicing/instalments/application/commands/collect-instalment/collect-instalment.handler';
import { CollectDueInstalmentEventHandler } from '@/contexts/servicing/instalments/application/event-handlers/collect-due-instalment.event-handler';
import { SimulatedPaymentProvider } from '@/contexts/servicing/instalments/infrastructure/external/simulated-payment-provider.adapter';
import { LoanInstalmentDueNoted } from '@/contexts/servicing/ledger/domain/events/loan-instalment-due-noted.event';
import { LoanPaymentReceivedPublisher } from '@/contexts/servicing/instalments/application/integration/publishers/loan-payment-received.publisher';
import { LoanPaymentReceived } from '@/contexts/servicing/instalments/domain/events/loan-payment-received.event';
import { GetLoanStatementHandler } from '@/contexts/servicing/ledger/application/queries/get-loan-statement/get-loan-statement.handler';
import { GetLoanStatementQuery } from '@/contexts/servicing/ledger/application/queries/get-loan-statement/get-loan-statement.query';
import { EventStoreGetLoanStatementReader } from '@/contexts/servicing/ledger/infrastructure/persistence/event-store-get-loan-statement.reader';
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
  const loanRepository = platform.adapter(
    new EventStoreLoanRepository(platform.eventSourcing.events, platform.eventSourcing.cipher),
    { kind: 'repository', context: 'servicing', token: 'LoanRepository' },
  );

  const personalDataErasure = platform.adapter(new RemotePersonalDataErasure(platform.eventSourcing.subjectKeys), {
    kind: 'external',
    context: 'servicing',
    token: 'PersonalDataErasure',
  });

  platform.commands.register(
    ErasePersonalDataPastRetentionCommand,
    new ErasePersonalDataPastRetentionHandler(loanRepository, personalDataErasure),
    { context: 'servicing' },
  );

  platform.commands.register(CloseLoanCommand, new CloseLoanHandler(loanRepository, platform.clock), {
    context: 'servicing',
  });

  platform.commands.register(
    RecordPayoutCommand,
    new RecordPayoutHandler(loanRepository, { clock: platform.clock, relations: platform.relations }),
    { context: 'servicing' },
  );

  const readLoanReader = platform.adapter(new EventStoreReadLoanReader(loanRepository), {
    kind: 'repository',
    context: 'servicing',
  });

  platform.queries.register(ReadLoanQuery, new ReadLoanHandler(readLoanReader), { context: 'servicing' });

  platform.commands.register(ComputeDueInstalmentsCommand, new ComputeDueInstalmentsHandler(loanRepository), {
    context: 'servicing',
  });

  platform.commands.register(RepayEarlyCommand, new RepayEarlyHandler(loanRepository, platform.clock), {
    context: 'servicing',
  });

  platform.commands.register(WriteOffLoanCommand, new WriteOffLoanHandler(loanRepository, platform.clock), {
    context: 'servicing',
  });

  platform.commands.register(ReverseWriteOffCommand, new ReverseWriteOffHandler(loanRepository, platform.clock), {
    context: 'servicing',
  });

  platform.commands.register(RescheduleLoanCommand, new RescheduleLoanHandler(loanRepository, platform.clock), {
    context: 'servicing',
  });

  platform.commands.register(RecordWithdrawalRepaymentCommand, new RecordWithdrawalRepaymentHandler(loanRepository), {
    context: 'servicing',
  });

  const paymentProvider = platform.adapter(new SimulatedPaymentProvider(), {
    kind: 'external',
    context: 'servicing',
    token: 'PaymentProvider',
  });

  platform.commands.register(
    CollectInstalmentCommand,
    new CollectInstalmentHandler(loanRepository, paymentProvider, platform.clock),
    {
      context: 'servicing',
    },
  );

  const getLoanStatementReader = platform.adapter(new EventStoreGetLoanStatementReader(loanRepository), {
    kind: 'repository',
    context: 'servicing',
  });

  platform.queries.register(GetLoanStatementQuery, new GetLoanStatementHandler(getLoanStatementReader), {
    context: 'servicing',
  });
  // /ddd-ts-kit:handlers
}

/** What the context does when an event happens: its own events and those of the other contexts. */
function registerReactions(platform: Platform): void {
  // ddd-ts-kit:reactions
  const borrowers = platform.adapter(new RemoteBorrowerIdentity(platform.customerIdentity), {
    kind: 'gateway',
    context: 'servicing',
    token: 'BorrowerIdentity',
  });

  const recordPayoutOnPayoutAuthorisedIntegrationHandler = new RecordPayoutOnPayoutAuthorisedIntegrationHandler(
    platform.commands,
    borrowers,
  );

  subscribeAll(platform.subscriberFor('servicing'), [
    consume(
      recordPayoutOnPayoutAuthorisedDefinition,
      {
        consumer: 'servicing.record-payout-on-payout-authorised',
        processed: platform.persistence.processedEvents,
        unitOfWork: platform.persistence.unitOfWork,
        scope: platform.scope,
      },
      (event) => recordPayoutOnPayoutAuthorisedIntegrationHandler.handle(event),
    ),
  ]);

  const loanPaidOutPublisher = platform.adapter(new LoanPaidOutPublisher(platform.publisher, platform.ids), {
    kind: 'domain-event-handler',
    context: 'servicing',
  });

  platform.domainEvents.on(LoanPaidOut.eventName, async (event) => {
    if (event instanceof LoanPaidOut) {
      await loanPaidOutPublisher.handle(event);
    }
  });

  const rescheduleOnDecisionIntegrationHandler = new RescheduleOnDecisionIntegrationHandler(platform.commands);

  subscribeAll(platform.subscriberFor('servicing'), [
    consume(
      rescheduleOnDecisionDefinition,
      {
        consumer: 'servicing.reschedule-on-decision',
        processed: platform.persistence.processedEvents,
        unitOfWork: platform.persistence.unitOfWork,
        scope: platform.scope,
      },
      (event) => rescheduleOnDecisionIntegrationHandler.handle(event),
    ),
  ]);

  const repayWithdrawnLoanIntegrationHandler = new RepayWithdrawnLoanIntegrationHandler(platform.commands);

  subscribeAll(platform.subscriberFor('servicing'), [
    consume(
      repayWithdrawnLoanDefinition,
      {
        consumer: 'servicing.repay-withdrawn-loan',
        processed: platform.persistence.processedEvents,
        unitOfWork: platform.persistence.unitOfWork,
        scope: platform.scope,
      },
      (event) => repayWithdrawnLoanIntegrationHandler.handle(event),
    ),
  ]);

  const collectDueInstalmentEventHandler = platform.adapter(new CollectDueInstalmentEventHandler(platform.commands), {
    kind: 'domain-event-handler',
    context: 'servicing',
  });

  platform.domainEvents.on(LoanInstalmentDueNoted.eventName, async (event) => {
    if (event instanceof LoanInstalmentDueNoted) {
      await collectDueInstalmentEventHandler.handle(event);
    }
  });

  const loanPaymentReceivedPublisher = platform.adapter(
    new LoanPaymentReceivedPublisher(platform.publisher, platform.ids),
    { kind: 'domain-event-handler', context: 'servicing' },
  );

  platform.domainEvents.on(LoanPaymentReceived.eventName, async (event) => {
    if (event instanceof LoanPaymentReceived) {
      await loanPaymentReceivedPublisher.handle(event);
    }
  });
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

  const computeDueInstalmentsJob = new ComputeDueInstalmentsJob(platform.commands);

  platform.jobs.register({
    name: 'servicing.compute-due-instalments',
    schedule: { cron: '0 1 * * *', timeZone: 'Europe/Paris' },
    tenancy: 'per-tenant',
    run: (execution) => computeDueInstalmentsJob.run(execution),
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
    requires(CloseLoanCommand, servicingPermissions['loan.close'], {
      resource: () => ({ type: 'context', id: 'servicing' }),
    }),
    requires(RecordPayoutCommand, servicingPermissions['loan.record-payout'], {
      resource: () => ({ type: 'context', id: 'servicing' }),
    }),
    requires(ReadLoanQuery, servicingPermissions['loan.read'], {
      resource: (query) => ({ type: 'loan', id: query.loanId }),
    }),
    requires(ComputeDueInstalmentsCommand, servicingPermissions['loan.compute-due'], {
      resource: () => ({ type: 'context', id: 'servicing' }),
    }),
    requires(RepayEarlyCommand, servicingPermissions['loan.repay-early'], {
      resource: () => ({ type: 'context', id: 'servicing' }),
    }),
    requires(WriteOffLoanCommand, servicingPermissions['loan.write-off'], {
      resource: () => ({ type: 'context', id: 'servicing' }),
    }),
    requires(ReverseWriteOffCommand, servicingPermissions['loan.write-off'], {
      resource: () => ({ type: 'context', id: 'servicing' }),
    }),
    requires(RescheduleLoanCommand, servicingPermissions['loan.reschedule'], {
      resource: () => ({ type: 'context', id: 'servicing' }),
    }),
    requires(RecordWithdrawalRepaymentCommand, servicingPermissions['loan.record-repayment'], {
      resource: () => ({ type: 'context', id: 'servicing' }),
    }),
    requires(CollectInstalmentCommand, servicingPermissions['loan.collect'], {
      resource: () => ({ type: 'context', id: 'servicing' }),
    }),
    requires(GetLoanStatementQuery, servicingPermissions['loan.read'], {
      resource: (query) => ({ type: 'loan', id: query.loanId }),
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
