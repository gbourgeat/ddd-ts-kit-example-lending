import type { Platform } from '@/platform/composition/platform';
import type { DeciderLevels } from '@/contexts/credit-application/decision/application/ports/decider-levels.port';
import { KeepDeciderLevelCommand } from '@/contexts/credit-application/decision/application/commands/keep-decider-level/keep-decider-level.command';
import { KeepDeciderLevelHandler } from '@/contexts/credit-application/decision/application/commands/keep-decider-level/keep-decider-level.handler';
import { ReadDeciderLevelQuery } from '@/contexts/credit-application/decision/application/queries/read-decider-level/read-decider-level.query';
import { ReadDeciderLevelHandler } from '@/contexts/credit-application/decision/application/queries/read-decider-level/read-decider-level.handler';

/** The command that keeps the level of each decider and the query that reads it, over the read model the module binds. */
export function registerDeciderLevelHandlers(platform: Platform, deciderLevels: DeciderLevels): void {
  platform.commands.register(KeepDeciderLevelCommand, new KeepDeciderLevelHandler(deciderLevels), {
    context: 'credit-application',
  });

  platform.queries.register(ReadDeciderLevelQuery, new ReadDeciderLevelHandler(deciderLevels), {
    context: 'credit-application',
  });
}
