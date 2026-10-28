import { AuthorizedCommand, type Actor, type EventStamp } from '@ddd-ts-kit/kernel';
import type { BrokerRegistrationRow } from '@/contexts/credit-application/file/application/ports/broker-registrations.port';

/** Keeps the registration of one broker in the read model: whether it is in force, and the event that said so. */
export class KeepBrokerRegistrationCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly row: BrokerRegistrationRow,
    readonly stamp: EventStamp,
  ) {
    super(actor);
  }
}
