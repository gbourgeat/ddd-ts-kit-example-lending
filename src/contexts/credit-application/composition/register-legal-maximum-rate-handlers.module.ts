import type { Platform } from '@/platform/composition/platform';
import type { LegalMaximumRates } from '@/contexts/credit-application/offer/application/ports/legal-maximum-rates.port';
import { KeepLegalMaximumRateCommand } from '@/contexts/credit-application/offer/application/commands/keep-legal-maximum-rate/keep-legal-maximum-rate.command';
import { KeepLegalMaximumRateHandler } from '@/contexts/credit-application/offer/application/commands/keep-legal-maximum-rate/keep-legal-maximum-rate.handler';
import { ReadLegalMaximumRateQuery } from '@/contexts/credit-application/offer/application/queries/read-legal-maximum-rate/read-legal-maximum-rate.query';
import { ReadLegalMaximumRateHandler } from '@/contexts/credit-application/offer/application/queries/read-legal-maximum-rate/read-legal-maximum-rate.handler';

/** The command that keeps the legal maximum rates and the query that reads them, over the read model the module binds. */
export function registerLegalMaximumRateHandlers(platform: Platform, legalMaximumRates: LegalMaximumRates): void {
  platform.commands.register(KeepLegalMaximumRateCommand, new KeepLegalMaximumRateHandler(legalMaximumRates), {
    context: 'credit-application',
  });

  platform.queries.register(ReadLegalMaximumRateQuery, new ReadLegalMaximumRateHandler(legalMaximumRates), {
    context: 'credit-application',
  });
}
