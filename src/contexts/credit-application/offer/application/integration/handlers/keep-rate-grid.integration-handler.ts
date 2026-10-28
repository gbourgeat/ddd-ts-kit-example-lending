import { systemActor, type CommandBus } from '@ddd-ts-kit/kernel';
import { rateGridPublishedV2, type RateGridPublishedV2 } from '@/contexts/credit-policy/published-language';

export class KeepRateGridIntegrationHandler {
  static readonly eventType = rateGridPublishedV2.type;

  readonly actor = systemActor('credit-application.keep-rate-grid');

  constructor(private readonly commands: CommandBus) {}

  async handle(event: RateGridPublishedV2): Promise<void> {
    // TODO(domain): translate `event.payload` (the language of credit-policy) into a command of credit-application, built with `this.actor` (nobody is calling: the handler acts as a system actor the authorization model has to grant), and execute it with `this.commands.execute(...)`; delivery is at least once, so the command has to be safe to repeat.
  }
}
