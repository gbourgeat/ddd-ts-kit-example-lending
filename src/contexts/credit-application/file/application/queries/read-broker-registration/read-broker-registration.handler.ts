import type { QueryHandler } from '@ddd-ts-kit/kernel';
import type { BrokerRegistrations } from '@/contexts/credit-application/file/application/ports/broker-registrations.port';
import type { ReadBrokerRegistrationQuery } from '@/contexts/credit-application/file/application/queries/read-broker-registration/read-broker-registration.query';
import type { ReadBrokerRegistrationResult } from '@/contexts/credit-application/file/application/queries/read-broker-registration/read-broker-registration.result';
import { UnknownBrokerRegistration } from '@/contexts/credit-application/file/domain/errors/unknown-broker-registration.error';

/** Answers the registration of a broker: in force since the day it came into force, or lapsed on the day it lapsed. */
export class ReadBrokerRegistrationHandler implements QueryHandler<ReadBrokerRegistrationQuery> {
  constructor(private readonly brokerRegistrations: BrokerRegistrations) {}

  async execute(query: ReadBrokerRegistrationQuery): Promise<ReadBrokerRegistrationResult> {
    const registration = await this.brokerRegistrations.get(query.brokerId);

    if (registration === undefined) {
      throw UnknownBrokerRegistration.forUnknownBrokerRegistration();
    }

    const changedAt = registration.changedAt.toISOString();

    if (registration.inForce) {
      return { brokerId: registration.brokerId, inForce: true, since: changedAt };
    }

    return { brokerId: registration.brokerId, inForce: false, until: changedAt };
  }
}
