import { stampOf, systemActor, type CommandBus } from '@ddd-ts-kit/kernel';
import {
  legalMaximumRatePublishedV2,
  type LegalMaximumRatePublishedV2,
} from '@/contexts/credit-policy/published-language';
import { KeepLegalMaximumRateCommand } from '@/contexts/credit-application/offer/application/commands/keep-legal-maximum-rate/keep-legal-maximum-rate.command';
import { legalMaximumRateRowOf } from '@/contexts/credit-application/offer/application/projections/legal-maximum-rate-row-of.projection';

// ddd-ts-kit-disable-next-line events/consumer-idempotent -- ADR-0005: registered in its module file, which the rule does not read
export class KeepLegalMaximumRateIntegrationHandler {
  static readonly eventType = legalMaximumRatePublishedV2.type;

  readonly actor = systemActor('credit-application.keep-legal-maximum-rate');

  constructor(private readonly commands: CommandBus) {}

  async handle(event: LegalMaximumRatePublishedV2): Promise<void> {
    await this.commands.execute(
      new KeepLegalMaximumRateCommand(this.actor, legalMaximumRateRowOf(event.payload), stampOf(event)),
    );
  }
}
