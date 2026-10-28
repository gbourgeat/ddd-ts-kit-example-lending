import type { Platform } from '@/platform/composition/platform';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import type { DeciderLevels } from '@/contexts/credit-application/decision/application/ports/decider-levels.port';
import type { DelegationTables } from '@/contexts/credit-application/decision/application/ports/delegation-tables.port';
import { DeciderLimitReader } from '@/contexts/credit-application/decision/application/projections/decider-limit-reader.projection';
import { DecideApplicationCommand } from '@/contexts/credit-application/decision/application/commands/decide-application/decide-application.command';
import { DecideApplicationHandler } from '@/contexts/credit-application/decision/application/commands/decide-application/decide-application.handler';

/** The command that decides an application, over the repository of the file and the read models of the limits. */
export function registerDecisionHandlers(
  platform: Platform,
  creditApplicationRepository: CreditApplicationRepository,
  readModels: { readonly deciderLevels: DeciderLevels; readonly delegationTables: DelegationTables },
): void {
  const deciderLimits = new DeciderLimitReader(readModels.deciderLevels, readModels.delegationTables);

  platform.commands.register(
    DecideApplicationCommand,
    new DecideApplicationHandler(creditApplicationRepository, deciderLimits, platform.clock),
    { context: 'credit-application' },
  );
}
