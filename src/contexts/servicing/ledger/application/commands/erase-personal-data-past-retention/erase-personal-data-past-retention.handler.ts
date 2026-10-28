import { expiredBefore, type CommandHandler, type RetentionPeriod } from '@ddd-ts-kit/kernel';
import type { LoanRepository } from '@/contexts/servicing/ledger/domain/repositories/loan.repository';
import type { PersonalDataErasure } from '@/contexts/servicing/ledger/application/ports/personal-data-erasure.port';
import type { ErasePersonalDataPastRetentionCommand } from '@/contexts/servicing/ledger/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';

/** How long the personal data of a loan is kept after it closes: ten years. */
const LOAN_RETENTION: RetentionPeriod = { years: 10 };

export class ErasePersonalDataPastRetentionHandler implements CommandHandler<ErasePersonalDataPastRetentionCommand> {
  constructor(
    private readonly loanRepository: LoanRepository,
    private readonly personalDataErasure: PersonalDataErasure,
  ) {}

  async execute(command: ErasePersonalDataPastRetentionCommand): Promise<void> {
    const cutoff = expiredBefore(LOAN_RETENTION, command.asOf);
    const pastRetention = await this.loanRepository.findClosedOnOrBefore(cutoff);

    for (const loan of pastRetention) {
      await this.personalDataErasure.erase(loan.id);
    }
  }
}
