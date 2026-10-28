import type { CommandHandler } from '@ddd-ts-kit/kernel';
import type { LoanRepository } from '@/contexts/servicing/ledger/domain/repositories/loan.repository';
import type { ClassifyArrearsCommand } from '@/contexts/servicing/arrears/application/commands/classify-arrears/classify-arrears.command';

export class ClassifyArrearsHandler implements CommandHandler<ClassifyArrearsCommand> {
  constructor(private readonly loanRepository: LoanRepository) {}

  async execute(command: ClassifyArrearsCommand): Promise<void> {
    // TODO(domain): "classify arrears" changes Loans that exist and writes nothing until you decide how: load the one `command` names with `this.loanRepository.findById`, throw its refusal when there is none, `UnknownLoan.forLoan(id)` (`ddd-ts-kit generate error servicing UnknownLoan forLoan`), call ONE intention method of the aggregate, then `save` it (its events leave with the save). A command that gives birth to one is generated with `--creates`; its handler calls `Loan.create` with the facts of `command` as value objects.
  }
}
