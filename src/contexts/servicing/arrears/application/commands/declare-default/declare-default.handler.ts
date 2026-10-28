import type { CommandHandler } from '@ddd-ts-kit/kernel';
import type { LoanRepository } from '@/contexts/servicing/ledger/domain/repositories/loan.repository';
import type { DeclareDefaultCommand } from '@/contexts/servicing/arrears/application/commands/declare-default/declare-default.command';

export class DeclareDefaultHandler implements CommandHandler<DeclareDefaultCommand> {
  constructor(private readonly loanRepository: LoanRepository) {}

  async execute(command: DeclareDefaultCommand): Promise<void> {
    const openLoans = await this.loanRepository.findOpen();

    for (const loan of openLoans) {
      loan.declareDefault(command.asOf);
      await this.loanRepository.save(loan);
    }
  }
}
