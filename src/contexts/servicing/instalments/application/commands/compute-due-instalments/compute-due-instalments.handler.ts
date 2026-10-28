import type { CommandHandler } from '@ddd-ts-kit/kernel';
import type { LoanRepository } from '@/contexts/servicing/ledger/domain/repositories/loan.repository';
import type { ComputeDueInstalmentsCommand } from '@/contexts/servicing/instalments/application/commands/compute-due-instalments/compute-due-instalments.command';

export class ComputeDueInstalmentsHandler implements CommandHandler<ComputeDueInstalmentsCommand> {
  constructor(private readonly loanRepository: LoanRepository) {}

  async execute(command: ComputeDueInstalmentsCommand): Promise<void> {
    const openLoans = await this.loanRepository.findOpen();

    for (const loan of openLoans) {
      loan.computeDueInstalments(command.asOf);
      await this.loanRepository.save(loan);
    }
  }
}
