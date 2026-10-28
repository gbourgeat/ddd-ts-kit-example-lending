import type { CommandHandler } from '@ddd-ts-kit/kernel';
import type { BrokerRegistrations } from '@/contexts/credit-application/file/application/ports/broker-registrations.port';
import type { KeepBrokerRegistrationCommand } from '@/contexts/credit-application/file/application/commands/keep-broker-registration/keep-broker-registration.command';

/** Writes the registration of the command's broker into the read model, unless the read model holds a later event. */
export class KeepBrokerRegistrationHandler implements CommandHandler<KeepBrokerRegistrationCommand> {
  constructor(private readonly brokerRegistrations: BrokerRegistrations) {}

  async execute(command: KeepBrokerRegistrationCommand): Promise<void> {
    const { row, stamp } = command;

    await this.brokerRegistrations.upsertIfNewer(row.brokerId, stamp, () => row);
  }
}
