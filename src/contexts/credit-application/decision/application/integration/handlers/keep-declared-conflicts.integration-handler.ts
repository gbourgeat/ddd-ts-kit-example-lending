import { systemActor, type CommandBus } from '@ddd-ts-kit/kernel';
import {
  conflictOfInterestDeclaredV1,
  type ConflictOfInterestDeclaredV1,
} from '@/contexts/branch-network/published-language';

export class KeepDeclaredConflictsIntegrationHandler {
  static readonly eventType = conflictOfInterestDeclaredV1.type;

  readonly actor = systemActor('credit-application.keep-declared-conflicts');

  constructor(private readonly commands: CommandBus) {}

  async handle(event: ConflictOfInterestDeclaredV1): Promise<void> {
    // TODO(domain): translate `event.payload` (the language of branch-network) into a command of credit-application, built with `this.actor` (nobody is calling: the handler acts as a system actor the authorization model has to grant), and execute it with `this.commands.execute(...)`; delivery is at least once, so the command has to be safe to repeat.
  }
}
