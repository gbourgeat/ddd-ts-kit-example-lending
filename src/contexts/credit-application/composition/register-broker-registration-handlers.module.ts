import type { Platform } from '@/platform/composition/platform';
import type { BrokerRegistrations } from '@/contexts/credit-application/file/application/ports/broker-registrations.port';
import { KeepBrokerRegistrationCommand } from '@/contexts/credit-application/file/application/commands/keep-broker-registration/keep-broker-registration.command';
import { KeepBrokerRegistrationHandler } from '@/contexts/credit-application/file/application/commands/keep-broker-registration/keep-broker-registration.handler';
import { ReadBrokerRegistrationQuery } from '@/contexts/credit-application/file/application/queries/read-broker-registration/read-broker-registration.query';
import { ReadBrokerRegistrationHandler } from '@/contexts/credit-application/file/application/queries/read-broker-registration/read-broker-registration.handler';

/** The command that keeps the broker registrations and the query that reads them, over the read model the module binds. */
export function registerBrokerRegistrationHandlers(platform: Platform, brokerRegistrations: BrokerRegistrations): void {
  platform.commands.register(KeepBrokerRegistrationCommand, new KeepBrokerRegistrationHandler(brokerRegistrations), {
    context: 'credit-application',
  });

  platform.queries.register(ReadBrokerRegistrationQuery, new ReadBrokerRegistrationHandler(brokerRegistrations), {
    context: 'credit-application',
  });
}
