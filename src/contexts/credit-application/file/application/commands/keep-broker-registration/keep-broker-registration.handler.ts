import type { CommandHandler } from '@ddd-ts-kit/kernel';
import type { RelationTuple, RelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import type { BrokerRegistrations } from '@/contexts/credit-application/file/application/ports/broker-registrations.port';
import type { KeepBrokerRegistrationCommand } from '@/contexts/credit-application/file/application/commands/keep-broker-registration/keep-broker-registration.command';

/**
 * Writes the registration of the command's broker into the read model, unless the read model holds a later event.
 * A registration in force makes the broker's account a broker of the context, so that it may bring applications; a
 * registration that lapsed takes that relation away.
 */
export class KeepBrokerRegistrationHandler implements CommandHandler<KeepBrokerRegistrationCommand> {
  constructor(
    private readonly brokerRegistrations: BrokerRegistrations,
    private readonly relations: RelationTupleStore,
  ) {}

  async execute(command: KeepBrokerRegistrationCommand): Promise<void> {
    const { row, stamp } = command;
    const written = await this.brokerRegistrations.upsertIfNewer(row.brokerId, stamp, () => row);

    if (written !== 'applied') {
      return;
    }

    const brokerOfTheContext: RelationTuple = {
      object: 'context:credit-application',
      relation: 'broker',
      subject: `user:${row.brokerId}`,
    };

    if (row.inForce) {
      await this.relations.write([brokerOfTheContext]);
    } else {
      await this.relations.delete([brokerOfTheContext]);
    }
  }
}
