import { ReadModelStore } from '@ddd-ts-kit/kernel';

/** One line of the broker registrations read model: whether the registration of a broker is in force, and the instant of the event that last said so. */
export type BrokerRegistrationRow = {
  readonly brokerId: string;
  readonly inForce: boolean;
  readonly changedAt: Date;
};

/** The broker registrations read model, kept from what brokerage announces: one line per broker. */
export abstract class BrokerRegistrations extends ReadModelStore<BrokerRegistrationRow> {}
