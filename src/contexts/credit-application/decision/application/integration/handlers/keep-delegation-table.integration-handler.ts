import { stampOf, systemActor, type CommandBus } from '@ddd-ts-kit/kernel';
import {
  delegationTablePublishedV2,
  type DelegationTablePublishedV2,
} from '@/contexts/credit-policy/published-language';
import { KeepDelegationTableCommand } from '@/contexts/credit-application/decision/application/commands/keep-delegation-table/keep-delegation-table.command';
import { delegationTableRowOf } from '@/contexts/credit-application/decision/application/projections/delegation-table-row-of.projection';

export class KeepDelegationTableIntegrationHandler {
  static readonly eventType = delegationTablePublishedV2.type;

  readonly actor = systemActor('credit-application.keep-delegation-table');

  constructor(private readonly commands: CommandBus) {}

  async handle(event: DelegationTablePublishedV2): Promise<void> {
    await this.commands.execute(
      new KeepDelegationTableCommand(this.actor, delegationTableRowOf(event.payload), stampOf(event)),
    );
  }
}
