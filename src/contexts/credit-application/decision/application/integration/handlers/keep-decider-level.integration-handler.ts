import { stampOf, systemActor, type CommandBus } from '@ddd-ts-kit/kernel';
import { staffMemberAppointedV2, type StaffMemberAppointedV2 } from '@/contexts/branch-network/published-language';
import { KeepDeciderLevelCommand } from '@/contexts/credit-application/decision/application/commands/keep-decider-level/keep-decider-level.command';
import { deciderLevelRowOf } from '@/contexts/credit-application/decision/application/projections/decider-level-row-of.projection';

// ddd-ts-kit-disable-next-line events/consumer-idempotent -- ADR-0005: registered in its module file, which the rule does not read
export class KeepDeciderLevelIntegrationHandler {
  static readonly eventType = staffMemberAppointedV2.type;

  readonly actor = systemActor('credit-application.keep-decider-level');

  constructor(private readonly commands: CommandBus) {}

  async handle(event: StaffMemberAppointedV2): Promise<void> {
    await this.commands.execute(
      new KeepDeciderLevelCommand(this.actor, deciderLevelRowOf(event.payload), stampOf(event)),
    );
  }
}
