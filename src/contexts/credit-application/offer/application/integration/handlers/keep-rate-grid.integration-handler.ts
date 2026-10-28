import { stampOf, systemActor, type CommandBus } from '@ddd-ts-kit/kernel';
import { rateGridPublishedV2, type RateGridPublishedV2 } from '@/contexts/credit-policy/published-language';
import { KeepRateGridCommand } from '@/contexts/credit-application/offer/application/commands/keep-rate-grid/keep-rate-grid.command';
import { rateGridRowOf } from '@/contexts/credit-application/offer/application/projections/rate-grid-row-of.projection';

// ddd-ts-kit-disable-next-line events/consumer-idempotent -- ADR-0005: registered in its module file, which the rule does not read
export class KeepRateGridIntegrationHandler {
  static readonly eventType = rateGridPublishedV2.type;

  readonly actor = systemActor('credit-application.keep-rate-grid');

  constructor(private readonly commands: CommandBus) {}

  async handle(event: RateGridPublishedV2): Promise<void> {
    await this.commands.execute(new KeepRateGridCommand(this.actor, rateGridRowOf(event.payload), stampOf(event)));
  }
}
