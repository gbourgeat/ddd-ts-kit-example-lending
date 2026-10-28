import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import type { LoanRepository } from '@/contexts/servicing/ledger/domain/repositories/loan.repository';
import { UnknownLoan } from '@/contexts/servicing/ledger/domain/errors/unknown-loan.error';
import type { RepaymentIncidentRegister } from '@/contexts/servicing/arrears/application/ports/repayment-incident-register.port';
import type { DeclareRepaymentIncidentCommand } from '@/contexts/servicing/arrears/application/commands/declare-repayment-incident/declare-repayment-incident.command';

export class DeclareRepaymentIncidentHandler implements CommandHandler<DeclareRepaymentIncidentCommand> {
  constructor(
    private readonly loanRepository: LoanRepository,
    private readonly register: RepaymentIncidentRegister,
    private readonly clock: Clock,
  ) {}

  async execute(command: DeclareRepaymentIncidentCommand): Promise<void> {
    const loan = await this.loanRepository.findById(command.loanId);

    if (loan === undefined) {
      throw UnknownLoan.forLoan(command.loanId);
    }

    if (!loan.declareRepaymentIncident(this.clock.now())) {
      return;
    }

    await this.loanRepository.save(loan);
    await this.register.declare(command.loanId);
  }
}
