import type { CommandHandler } from '@ddd-ts-kit/kernel';
import type { LoanRepository } from '@/contexts/servicing/ledger/domain/repositories/loan.repository';
import type { ClassifyArrearsCommand } from '@/contexts/servicing/arrears/application/commands/classify-arrears/classify-arrears.command';

export class ClassifyArrearsHandler implements CommandHandler<ClassifyArrearsCommand> {
  constructor(private readonly loanRepository: LoanRepository) {}

  async execute(command: ClassifyArrearsCommand): Promise<void> {
    const openLoans = await this.loanRepository.findOpen();

    for (const loan of openLoans) {
      loan.classifyArrears(command.asOf);
      await this.loanRepository.save(loan);
    }
  }
}
