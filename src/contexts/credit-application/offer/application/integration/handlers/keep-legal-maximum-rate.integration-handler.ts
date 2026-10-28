import { systemActor, type CommandBus } from '@ddd-ts-kit/kernel';
import {
  legalMaximumRatePublishedV2,
  type LegalMaximumRatePublishedV2,
} from '@/contexts/credit-policy/published-language';

export class KeepLegalMaximumRateIntegrationHandler {
  static readonly eventType = legalMaximumRatePublishedV2.type;

  readonly actor = systemActor('credit-application.keep-legal-maximum-rate');

  constructor(private readonly commands: CommandBus) {}

  async handle(event: LegalMaximumRatePublishedV2): Promise<void> {
    // TODO(domain): translate `event.payload` (the language of credit-policy) into a command of credit-application, built with `this.actor` (nobody is calling: the handler acts as a system actor the authorization model has to grant), and execute it with `this.commands.execute(...)`; delivery is at least once, so the command has to be safe to repeat.
  }
}
