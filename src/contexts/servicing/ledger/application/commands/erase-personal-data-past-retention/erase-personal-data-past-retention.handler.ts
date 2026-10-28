import type { Clock, CommandHandler, IdGenerator } from '@ddd-ts-kit/kernel';
import { Loan } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';
import type { LoanRepository } from '@/contexts/servicing/ledger/domain/repositories/loan.repository';
import type { ErasePersonalDataPastRetentionCommand } from '@/contexts/servicing/ledger/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';

export class ErasePersonalDataPastRetentionHandler implements CommandHandler<ErasePersonalDataPastRetentionCommand> {
  constructor(
    private readonly loanRepository: LoanRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(command: ErasePersonalDataPastRetentionCommand): Promise<string> {
    // TODO(domain): decide what "erase personal data past retention" does to a Loan: either it gives birth to one (keep `create`, pass the facts of `command` as value objects), or it changes an existing one (load it with `findById`, throw its refusal when there is none, `UnknownLoan.forLoan(id)` (`ddd-ts-kit generate error servicing UnknownLoan forLoan`), call ONE intention method). The events it records leave with the save: nothing else to do here.
    const loan = Loan.create(this.ids.next(), this.clock.now());

    await this.loanRepository.save(loan);

    return loan.id;
  }
}
