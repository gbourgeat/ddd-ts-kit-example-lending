import { PolicyAccess } from '@ddd-ts-kit/auth';
import {
  InMemoryDomainEventDispatcher,
  InMemoryFileStorage,
  ScopedActorContext,
  dispatchingOnSave,
  reportAfterCommitFailures,
  type DomainEventDispatcher,
} from '@ddd-ts-kit/kernel';
import type { RelationTupleStore } from '@ddd-ts-kit/auth/rebac';
import type { TracedApplication } from '@ddd-ts-kit/tracing';
import type { CustomerAdvisorBranchContract } from '@/contexts/branch-network/published-language';
import { CustomerAdvisorBranchAnswer } from '@/contexts/branch-network/infrastructure/external/customer-advisor-branch.answer';
import { PrismaPortfolioRepository } from '@/contexts/branch-network/infrastructure/persistence/prisma-portfolio.repository';
import { accessPolicies } from '@/platform/auth/authorization/access-policies';
import { createAuthorizer } from '@/platform/auth/authorization/create-authorizer';
import { createRelationTuples } from '@/platform/auth/relationships/create-relation-tuples';
import { StreamAuditReader } from '@/platform/audit/streams/stream-audit-reader';
import { UseCaseProtection } from '@/platform/auth/authorization/use-case-protection';
import { createCommandBus } from '@/platform/buses/create-command-bus';
import { createQueryBus } from '@/platform/buses/create-query-bus';
import { layFoundations, type Foundations } from '@/platform/composition/lay-foundations';
import type { Platform } from '@/platform/composition/platform';
import type { PlatformOptions } from '@/platform/composition/platform-options';
import type { Persistence } from '@/platform/database/persistence';
import { platformEvents } from '@/platform/events/platform-events';
import { createFiles, type Files } from '@/platform/files/create-files';
import { createBackgroundWork } from '@/platform/jobs/create-background-work';
import { defaultPolicy } from '@/platform/resilience/default-policy';
import { defaultResilienceSettings } from '@/platform/resilience/default-resilience-settings';
import { ownPolicy } from '@/platform/resilience/own-policy';
import type { ResilienceSettings } from '@/platform/resilience/resilience-settings';

/**
 * The platform, assembled: the foundations, the domain events, the guard of the use cases, the
 * two buses, the event ports, the background work, the files and what every adapter is wrapped in.
 * Replacing a provider (another broker, another clock) happens here and nowhere else.
 */
export function createPlatform(persistence: Persistence, options: PlatformOptions): Platform {
  const foundations = layFoundations(persistence, options);
  const { traced, ...founded } = foundations;
  const onDecision = foundations.audit.decisions;
  const { clock, scope } = foundations;
  const domainEvents = domainEventsOf(foundations);
  const relations = createRelationTuples(persistence.database);
  const authorizer = createAuthorizer(relations);
  const protection = new UseCaseProtection(authorizer, onDecision);
  const adapter = adapterOf(options.resilience ?? defaultResilienceSettings, { traced, domainEvents });
  const files = filesOf(options, foundations);
  const commands = createCommandBus(foundations, { guard: protection.guard, persistence, files, redis: options.redis });

  return {
    ...founded,
    retention: options.retention ?? {},
    audit: { ...foundations.audit, reader: new StreamAuditReader(foundations.audit.reader, scope, authorizer) },
    ...platformEvents(persistence, options, foundations),
    // The queue, its worker and the runner of the process managers: a timeout is a command the runner sends on the bus.
    ...createBackgroundWork({ persistence, options, foundations, commands }),
    commands,
    queries: createQueryBus(foundations, protection.guard),
    domainEvents,
    persistence,
    relations,
    customerAdvisorBranch: customerAdvisorBranchOf(persistence, relations, foundations),
    access: new PolicyAccess({ authorizer, clock, policies: accessPolicies, onDecision }),
    actors: new ScopedActorContext(scope, foundations.ids),
    adapter,
    selfGoverned: (instance, info) => adapter(ownPolicy()(instance, info), info),
    protection,
    files,
  };
}

/**
 * The domain events of the traced application; a handler of the after-commit phase that fails is
 * logged and reported: the command it follows is committed, and answers.
 */
function domainEventsOf({ traced, errors, logger, scope }: Foundations): DomainEventDispatcher {
  const afterCommitFailed = reportAfterCommitFailures({ reporter: errors, logger, scope });

  return traced.domainEvents(new InMemoryDomainEventDispatcher(afterCommitFailed));
}

/** The branch of a customer's advisor, answered from the portfolios of branch-network. */
function customerAdvisorBranchOf(
  persistence: Persistence,
  relations: RelationTupleStore,
  { scope, clock }: Foundations,
): CustomerAdvisorBranchContract {
  return new CustomerAdvisorBranchAnswer(relations, new PrismaPortfolioRepository(persistence.database, scope, clock));
}

/** Where the content of files lives: the storage of `main.ts`; left out (the tools, the tests), the memory of the process. */
function filesOf(options: PlatformOptions, foundations: Foundations): Files {
  return createFiles(options.files ?? new InMemoryFileStorage(), foundations);
}

interface Outside {
  readonly traced: TracedApplication;
  readonly domainEvents: DomainEventDispatcher;
}

/**
 * Around every adapter, outermost first: its span, for a repository the dispatch of the domain
 * events of what it saves (handlers only save), then the retries and the time limit of what
 * leaves the process.
 */
function adapterOf(settings: ResilienceSettings, { traced, domainEvents }: Outside): Platform['adapter'] {
  const governed = defaultPolicy(settings);

  return (instance, info) => {
    const resilient = governed(instance, info);
    const saving = info.kind === 'repository' ? dispatchingOnSave(resilient, () => domainEvents) : resilient;

    return traced.binding(saving, { ...info, context: info.context ?? 'platform' });
  };
}
