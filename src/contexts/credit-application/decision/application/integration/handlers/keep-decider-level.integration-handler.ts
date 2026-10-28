import { systemActor, type CommandBus } from '@ddd-ts-kit/kernel';
import { staffMemberAppointedV2, type StaffMemberAppointedV2 } from '@/contexts/branch-network/published-language';

export class KeepDeciderLevelIntegrationHandler {
  static readonly eventType = staffMemberAppointedV2.type;

  readonly actor = systemActor('credit-application.keep-decider-level');

  constructor(private readonly commands: CommandBus) {}

  async handle(event: StaffMemberAppointedV2): Promise<void> {
    // TODO(domain): translate `event.payload` (the language of branch-network) into a command of credit-application, built with `this.actor` (nobody is calling: the handler acts as a system actor the authorization model has to grant), and execute it with `this.commands.execute(...)`; delivery is at least once, so the command has to be safe to repeat.
  }
}
