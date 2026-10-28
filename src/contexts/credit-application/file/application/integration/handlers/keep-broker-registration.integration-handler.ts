import { stampOf, systemActor, type CommandBus } from '@ddd-ts-kit/kernel';
import { brokerRegisteredV1, type BrokerRegisteredV1 } from '@/contexts/brokerage/published-language';
import { KeepBrokerRegistrationCommand } from '@/contexts/credit-application/file/application/commands/keep-broker-registration/keep-broker-registration.command';

/** Keeps a broker's registration in force from the day brokerage registered it. */
export class KeepBrokerRegistrationIntegrationHandler {
  static readonly eventType = brokerRegisteredV1.type;

  readonly actor = systemActor('credit-application.keep-broker-registration');

  constructor(private readonly commands: CommandBus) {}

  async handle(event: BrokerRegisteredV1): Promise<void> {
    const stamp = stampOf(event);
    const row = { brokerId: event.payload.brokerId, inForce: true, changedAt: new Date(stamp.occurredAt) };

    await this.commands.execute(new KeepBrokerRegistrationCommand(this.actor, row, stamp));
  }
}
