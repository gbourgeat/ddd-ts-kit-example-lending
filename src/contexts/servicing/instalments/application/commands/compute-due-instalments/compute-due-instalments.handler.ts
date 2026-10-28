import type { CommandHandler } from '@ddd-ts-kit/kernel';
import type { LoanRepository } from '@/contexts/servicing/ledger/domain/repositories/loan.repository';
import type { ComputeDueInstalmentsCommand } from '@/contexts/servicing/instalments/application/commands/compute-due-instalments/compute-due-instalments.command';

export class ComputeDueInstalmentsHandler implements CommandHandler<ComputeDueInstalmentsCommand> {
  constructor(private readonly loanRepository: LoanRepository) {}

  async execute(command: ComputeDueInstalmentsCommand): Promise<void> {
    // TODO(domain): "compute due instalments" changes Loans that exist and writes nothing until you decide how: load the one `command` names with `this.loanRepository.findById`, throw its refusal when there is none, `UnknownLoan.forLoan(id)` (`ddd-ts-kit generate error servicing UnknownLoan forLoan`), call ONE intention method of the aggregate, then `save` it (its events leave with the save). A command that gives birth to one is generated with `--creates`; its handler calls `Loan.create` with the facts of `command` as value objects.
  }
}
