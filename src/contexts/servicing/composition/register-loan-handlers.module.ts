import type { Platform } from '@/platform/composition/platform';
import { ErasePersonalDataPastRetentionCommand } from '@/contexts/servicing/ledger/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';
import { ErasePersonalDataPastRetentionHandler } from '@/contexts/servicing/ledger/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.handler';
import { CloseLoanCommand } from '@/contexts/servicing/ledger/application/commands/close-loan/close-loan.command';
import { CloseLoanHandler } from '@/contexts/servicing/ledger/application/commands/close-loan/close-loan.handler';
import { RecordPayoutCommand } from '@/contexts/servicing/ledger/application/commands/record-payout/record-payout.command';
import { RecordPayoutHandler } from '@/contexts/servicing/ledger/application/commands/record-payout/record-payout.handler';
import { ReadLoanHandler } from '@/contexts/servicing/ledger/application/queries/read-loan/read-loan.handler';
import { ReadLoanQuery } from '@/contexts/servicing/ledger/application/queries/read-loan/read-loan.query';
import { ComputeDueInstalmentsCommand } from '@/contexts/servicing/instalments/application/commands/compute-due-instalments/compute-due-instalments.command';
import { ComputeDueInstalmentsHandler } from '@/contexts/servicing/instalments/application/commands/compute-due-instalments/compute-due-instalments.handler';
import { RepayEarlyCommand } from '@/contexts/servicing/ledger/application/commands/repay-early/repay-early.command';
import { RepayEarlyHandler } from '@/contexts/servicing/ledger/application/commands/repay-early/repay-early.handler';
import { WriteOffLoanCommand } from '@/contexts/servicing/ledger/application/commands/write-off-loan/write-off-loan.command';
import { WriteOffLoanHandler } from '@/contexts/servicing/ledger/application/commands/write-off-loan/write-off-loan.handler';
import { ReverseWriteOffCommand } from '@/contexts/servicing/ledger/application/commands/reverse-write-off/reverse-write-off.command';
import { ReverseWriteOffHandler } from '@/contexts/servicing/ledger/application/commands/reverse-write-off/reverse-write-off.handler';
import { RescheduleLoanCommand } from '@/contexts/servicing/ledger/application/commands/reschedule-loan/reschedule-loan.command';
import { RescheduleLoanHandler } from '@/contexts/servicing/ledger/application/commands/reschedule-loan/reschedule-loan.handler';
import { RecordWithdrawalRepaymentCommand } from '@/contexts/servicing/ledger/application/commands/record-withdrawal-repayment/record-withdrawal-repayment.command';
import { RecordWithdrawalRepaymentHandler } from '@/contexts/servicing/ledger/application/commands/record-withdrawal-repayment/record-withdrawal-repayment.handler';
import { CollectInstalmentCommand } from '@/contexts/servicing/instalments/application/commands/collect-instalment/collect-instalment.command';
import { CollectInstalmentHandler } from '@/contexts/servicing/instalments/application/commands/collect-instalment/collect-instalment.handler';
import { GetLoanStatementHandler } from '@/contexts/servicing/ledger/application/queries/get-loan-statement/get-loan-statement.handler';
import { GetLoanStatementQuery } from '@/contexts/servicing/ledger/application/queries/get-loan-statement/get-loan-statement.query';
import type { PaymentProvider } from '@/contexts/servicing/instalments/application/ports/payment-provider.port';
import type { PersonalDataErasure } from '@/contexts/servicing/ledger/application/ports/personal-data-erasure.port';
import type { ReadLoanReader } from '@/contexts/servicing/ledger/application/ports/read-loan-reader.port';
import type { GetLoanStatementReader } from '@/contexts/servicing/ledger/application/ports/get-loan-statement-reader.port';
import type { LoanRepository } from '@/contexts/servicing/ledger/domain/repositories/loan.repository';

/** What the module file of servicing binds, and the registrations here are given: the adapters are instantiated there only. */
export interface ServicingBindings {
  readonly loanRepository: LoanRepository;
  readonly personalDataErasure: PersonalDataErasure;
  readonly readLoanReader: ReadLoanReader;
  readonly getLoanStatementReader: GetLoanStatementReader;
  readonly paymentProvider: PaymentProvider;
}

/** The commands and queries of the ledger and of the instalments, over the repository of loans the module binds. */
export function registerLoanHandlers(platform: Platform, given: ServicingBindings): void {
  registerLedgerCommands(platform, given);
  registerLedgerQueries(platform, given);
  registerInstalmentCommands(platform, given);
}

function registerLedgerCommands(platform: Platform, { loanRepository, personalDataErasure }: ServicingBindings): void {
  const context = { context: 'servicing' };

  platform.commands.register(
    ErasePersonalDataPastRetentionCommand,
    new ErasePersonalDataPastRetentionHandler(loanRepository, personalDataErasure),
    context,
  );

  platform.commands.register(CloseLoanCommand, new CloseLoanHandler(loanRepository, platform.clock), context);

  platform.commands.register(
    RecordPayoutCommand,
    new RecordPayoutHandler(loanRepository, { clock: platform.clock, relations: platform.relations }),
    context,
  );

  platform.commands.register(RepayEarlyCommand, new RepayEarlyHandler(loanRepository, platform.clock), context);
  platform.commands.register(WriteOffLoanCommand, new WriteOffLoanHandler(loanRepository, platform.clock), context);

  platform.commands.register(
    ReverseWriteOffCommand,
    new ReverseWriteOffHandler(loanRepository, platform.clock),
    context,
  );

  platform.commands.register(RescheduleLoanCommand, new RescheduleLoanHandler(loanRepository, platform.clock), context);

  platform.commands.register(
    RecordWithdrawalRepaymentCommand,
    new RecordWithdrawalRepaymentHandler(loanRepository),
    context,
  );
}

function registerLedgerQueries(
  platform: Platform,
  { readLoanReader, getLoanStatementReader }: ServicingBindings,
): void {
  platform.queries.register(ReadLoanQuery, new ReadLoanHandler(readLoanReader), { context: 'servicing' });

  platform.queries.register(GetLoanStatementQuery, new GetLoanStatementHandler(getLoanStatementReader), {
    context: 'servicing',
  });
}

function registerInstalmentCommands(platform: Platform, { loanRepository, paymentProvider }: ServicingBindings): void {
  const context = { context: 'servicing' };

  platform.commands.register(ComputeDueInstalmentsCommand, new ComputeDueInstalmentsHandler(loanRepository), context);

  platform.commands.register(
    CollectInstalmentCommand,
    new CollectInstalmentHandler(loanRepository, paymentProvider, platform.clock),
    context,
  );
}
