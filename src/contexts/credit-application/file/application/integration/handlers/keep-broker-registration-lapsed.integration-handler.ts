import { stampOf, systemActor, type CommandBus } from '@ddd-ts-kit/kernel';
import { brokerRegistrationLapsedV1, type BrokerRegistrationLapsedV1 } from '@/contexts/brokerage/published-language';
import { KeepBrokerRegistrationCommand } from '@/contexts/credit-application/file/application/commands/keep-broker-registration/keep-broker-registration.command';

/** Keeps a broker's registration lapsed from the day brokerage announced it: the broker may no longer bring applications. */
// ddd-ts-kit-disable-next-line events/consumer-idempotent -- ADR-0005: registered in its module file, which the rule does not read
export class KeepBrokerRegistrationLapsedIntegrationHandler {
  static readonly eventType = brokerRegistrationLapsedV1.type;

  readonly actor = systemActor('credit-application.keep-broker-registration');

  constructor(private readonly commands: CommandBus) {}

  async handle(event: BrokerRegistrationLapsedV1): Promise<void> {
    const stamp = stampOf(event);
    const row = { brokerId: event.payload.brokerId, inForce: false, changedAt: new Date(stamp.occurredAt) };

    await this.commands.execute(new KeepBrokerRegistrationCommand(this.actor, row, stamp));
  }
}
