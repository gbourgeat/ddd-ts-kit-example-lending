import type { CommandHandler } from '@ddd-ts-kit/kernel';
import type { LegalMaximumRates } from '@/contexts/credit-application/offer/application/ports/legal-maximum-rates.port';
import type { KeepLegalMaximumRateCommand } from '@/contexts/credit-application/offer/application/commands/keep-legal-maximum-rate/keep-legal-maximum-rate.command';

/** Writes the legal maximum rate of the command into the read model, unless the read model holds a later event. */
export class KeepLegalMaximumRateHandler implements CommandHandler<KeepLegalMaximumRateCommand> {
  constructor(private readonly legalMaximumRates: LegalMaximumRates) {}

  async execute(command: KeepLegalMaximumRateCommand): Promise<void> {
    const { row, stamp } = command;

    await this.legalMaximumRates.upsertIfNewer(row.legalMaximumRateId, stamp, () => row);
  }
}
