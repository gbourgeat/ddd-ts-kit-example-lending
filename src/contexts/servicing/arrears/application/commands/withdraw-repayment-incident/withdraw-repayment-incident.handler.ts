import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import type { LoanRepository } from '@/contexts/servicing/ledger/domain/repositories/loan.repository';
import { UnknownLoan } from '@/contexts/servicing/ledger/domain/errors/unknown-loan.error';
import type { RepaymentIncidentRegister } from '@/contexts/servicing/arrears/application/ports/repayment-incident-register.port';
import type { WithdrawRepaymentIncidentCommand } from '@/contexts/servicing/arrears/application/commands/withdraw-repayment-incident/withdraw-repayment-incident.command';

export class WithdrawRepaymentIncidentHandler implements CommandHandler<WithdrawRepaymentIncidentCommand> {
  constructor(
    private readonly loanRepository: LoanRepository,
    private readonly register: RepaymentIncidentRegister,
    private readonly clock: Clock,
  ) {}

  async execute(command: WithdrawRepaymentIncidentCommand): Promise<void> {
    const loan = await this.loanRepository.findById(command.loanId);

    if (loan === undefined) {
      throw UnknownLoan.forLoan(command.loanId);
    }

    if (!loan.withdrawRepaymentIncident(this.clock.now())) {
      return;
    }

    await this.loanRepository.save(loan);
    await this.register.withdraw(command.loanId);
  }
}
