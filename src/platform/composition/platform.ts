import type { AspectInfo } from '@ddd-ts-kit/aspects';
import type { Access } from '@ddd-ts-kit/auth';
import type {
  ActorContext,
  Cache,
  Clock,
  DomainEventDispatcher,
  ErrorReporter,
  ExecutionScope,
  IdGenerator,
  InMemoryCommandBus,
  InMemoryQueryBus,
  IntegrationEventPublisher,
  IntegrationEventSubscriber,
  JobQueue,
  JobScheduler,
  Logger,
  Metrics,
  ProcessRunner,
  RateLimiter,
} from '@ddd-ts-kit/kernel';
import type { Audit } from '@/platform/audit/create-audit';
import type { RelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import type { UseCaseProtection } from '@/platform/auth/authorization/use-case-protection';
import type { Persistence } from '@/platform/database/persistence';
import type { RetentionPeriods } from '@/platform/config/read-retention-periods';
import type { EventSourcing } from '@/platform/event-sourcing/create-event-sourcing';
import type { Files } from '@/platform/files/create-files';
import type { CustomerAdvisorBranchContract } from '@/contexts/branch-network/published-language';
import type { BackgroundJobs } from '@/platform/jobs/background-jobs';

/** Wraps an adapter from outside: a span for its kind and, for what leaves the process, the default policy unless it states its own. */
type Adapt = <T extends object>(instance: T, info: AspectInfo) => T;

/** The technical capabilities every context receives. */
export interface Platform {
  /** The in-process buses: contexts register their handlers on them, routes and integration event handlers only see the `CommandBus` and `QueryBus` ports. */
  readonly commands: InMemoryCommandBus;
  readonly queries: InMemoryQueryBus;
  readonly clock: Clock;
  readonly ids: IdGenerator;
  readonly domainEvents: DomainEventDispatcher;
  /** What use cases publish through. */
  readonly publisher: IntegrationEventPublisher;
  readonly subscriber: IntegrationEventSubscriber;

  /** The subscriber of one consuming context: a broker gives each context queues of its own. */
  subscriberFor(context: string): IntegrationEventSubscriber;

  /** The provider itself: what the outbox relay delivers to. */
  readonly eventBus: IntegrationEventPublisher;
  readonly persistence: Persistence;
  /** How long each copy of personal data is kept, by copy: what the nightly erasure acts on. */
  readonly retention: RetentionPeriods;
  /** The relationships the authorizer reads, written in the transaction of the change they describe. */
  readonly relations: RelationTupleStore;
  /** The branch of a customer's advisor, answered by branch-network: what a context reaches through its gateway, never the module of another context. */
  readonly customerAdvisorBranch: CustomerAdvisorBranchContract;
  /** Asks the policies about one element, then the authorizer: for the rules that need loaded state. */
  readonly access: Access;
  /**
   * The work in progress (correlation id, actor, tenant), for infrastructure only: audit
   * columns, tenant scoping, consumed events. Use cases get the actor in their message.
   */
  readonly scope: ExecutionScope;
  /** The actor of the execution scope, for an adapter written against `ActorContext`. */
  readonly actors: ActorContext;
  readonly logger: Logger;
  readonly metrics: Metrics;
  /** Where what stands around the use cases reports an unexpected failure: the buses, the jobs, the HTTP boundary. A handler throws and never calls it. */
  readonly errors: ErrorReporter;
  readonly cache: Cache;
  readonly rateLimiter: RateLimiter;
  /** Where a context registers its scheduled jobs; the application starts it when this process runs the jobs. */
  readonly jobs: JobScheduler;
  /** What a use case enqueues through: a background job is written with its command and run later by the worker, as the actor that enqueued it. */
  readonly jobQueue: JobQueue;
  /** Where a context registers its background jobs; the application starts it when this process runs the jobs. */
  readonly backgroundJobs: BackgroundJobs;
  /** Runs the steps of the process managers, in the unit of work of the step, and delivers their timeouts through the queue. */
  readonly processes: ProcessRunner;
  readonly adapter: Adapt;
  /** The same, for an adapter that states its own policy, as aspects or as decorators on its class. */
  readonly selfGoverned: Adapt;
  readonly protection: UseCaseProtection;
  readonly audit: Audit;
  /** The event store, the keys of the data subjects, audited, and the cipher of the personal values of the stored events: what an event-sourced repository adapter loads, saves and seals through, and whose keys `scripts/privacy-erase.ts` destroys. */
  readonly eventSourcing: EventSourcing;
  /** Where files live, the keys they are stored under and the staging that keeps them consistent with the database: never their content in a table. */
  readonly files: Files;
}
