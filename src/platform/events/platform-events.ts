import { OutboxPublisher } from '@ddd-ts-kit/events';
import { scopedPublisher } from '@ddd-ts-kit/kernel';
import { tracedPublisher, tracedSubscriber } from '@ddd-ts-kit/tracing';
import type { Foundations } from '@/platform/composition/lay-foundations';
import type { Platform } from '@/platform/composition/platform';
import type { PlatformOptions } from '@/platform/composition/platform-options';
import type { Persistence } from '@/platform/database/persistence';

type Events = Pick<Platform, 'publisher' | 'subscriber' | 'eventBus' | 'subscriberFor'>;

/**
 * Use cases publish with the correlation id of the work in progress, so everything one request
 * causes is found again.
 */
export function platformEvents(persistence: Persistence, options: PlatformOptions, foundations: Foundations): Events {
  const { events } = options;
  const { scope, traced } = foundations;
  const trace = options.traceConsumers ?? 'continue';
  // `outbox append <type>` inside the request; the relay publishes later, in the same trace.
  const publisher = traced.publisher(scopedPublisher(new OutboxPublisher(persistence.outbox), scope));

  return {
    publisher,
    subscriber: tracedSubscriber(events.bus, { trace }),
    subscriberFor: (context) => tracedSubscriber(events.forConsumer(context), { trace }),
    eventBus: tracedPublisher(events.bus),
  };
}
