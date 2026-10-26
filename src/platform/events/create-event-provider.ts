import { KafkaEventBus } from '@ddd-ts-kit/kafka';
import { DeadLetterReports, NoopErrorReporter, type ErrorReporter } from '@ddd-ts-kit/kernel';
import type { AppConfig } from '@/platform/config/app-config';
import { aggregateKeyOf } from '@/platform/events/aggregate-key-of';
import type { EventProvider } from '@/platform/events/event-provider';

/**
 * Kafka: the relay of the outbox produces to one topic per event type and marks a record
 * published once the in-sync replicas acknowledged it, each consuming context is a consumer
 * group of its own name and commits an offset after its unit of work committed.
 */
export function createEventProvider(config: AppConfig, errors: ErrorReporter = new NoopErrorReporter()): EventProvider {
  // An event the broker gives up (retries exhausted, poison message) is reported; a delivery that fails and is retried is not.
  const deadLetters = new DeadLetterReports(errors);

  const bus = new KafkaEventBus({
    brokers: config.kafkaBrokers,
    keyOf: aggregateKeyOf,
    // Built before the application has a logger: one JSON line in the shape of its log lines. Codes only reach this hook, never messages: it is safe to log as is.
    onFailure: (failure) => {
      console.error(JSON.stringify({ level: 'error', message: 'event bus failure', ...failure }));
      deadLetters.onFailure(failure);
    },
  });

  return {
    bus,
    // Remembers what a handler threw, so that the report of an event given up carries the real error and its stack.
    forConsumer: (name) => deadLetters.observing(bus.forConsumer(name)),
    // Fails at startup, not at the first record.
    start: () => bus.assertTopology(),
    close: () => bus.close(),
  };
}
