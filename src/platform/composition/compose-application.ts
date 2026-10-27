import { installAspectRuntime } from '@ddd-ts-kit/aspects';
import type { Authenticator, UseCaseDeclaration } from '@ddd-ts-kit/auth';
import { subscribeAll } from '@ddd-ts-kit/events';
import { defineRoutes, type Route } from '@ddd-ts-kit/http';
import type { Type } from '@nestjs/common';
import { type NestControllers, nestControllers } from '@ddd-ts-kit/http/nest';
import { CommandBus, QueryBus } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { ArchiveAuditEntries } from '@ddd-ts-kit/audit';
import { PurgeStagedFiles } from '@ddd-ts-kit/kernel';
import type { IntegrationEventPublisher, IntegrationEventSubscriber, Logger, RateLimiter } from '@ddd-ts-kit/kernel';
import { auditModule } from '@/platform/audit/audit.module';
import { httpBoundary, type HttpBoundary } from '@/platform/auth/authentication/http-boundary';
import { presentationOf, type Presentation } from '@/platform/http/presentation-of';
import { withForms } from '@/platform/http/with-forms';
import { relateSystemActors } from '@/platform/auth/relationships/relate-system-actors';
import { createPlatform } from '@/platform/composition/create-platform';
import { platformErrorMapper } from '@/platform/composition/platform-error-mapper';
import type { Persistence } from '@/platform/database/persistence';
import { fileRoutes } from '@/platform/files/file-routes';
import type { Platform } from '@/platform/composition/platform';
import type { PlatformOptions } from '@/platform/composition/platform-options';
import { runPurge } from '@/platform/privacy/run-purge';
// ddd-ts-kit:imports
import { identityModule } from '@/contexts/identity/identity.module';
import { dataProtectionModule } from '@/contexts/data-protection/data-protection.module';
import { creditPolicyModule } from '@/contexts/credit-policy/credit-policy.module';
import { creditScoringModule } from '@/contexts/credit-scoring/credit-scoring.module';
import { brokerageModule } from '@/contexts/brokerage/brokerage.module';
import { customerDueDiligenceModule } from '@/contexts/customer-due-diligence/customer-due-diligence.module';
import { branchNetworkModule } from '@/contexts/branch-network/branch-network.module';
import { creditApplicationModule } from '@/contexts/credit-application/credit-application.module';
import { servicingModule } from '@/contexts/servicing/servicing.module';
import { financialCrimeModule } from '@/contexts/financial-crime/financial-crime.module';
import { reportingModule } from '@/contexts/reporting/reporting.module';
// /ddd-ts-kit:imports

interface ContextWiring {
  readonly name: string;
  /** What each command and query of the context requires, or that it is public. */
  readonly useCases: readonly UseCaseDeclaration[];
  readonly routes: readonly Route[];
  /** Its Nest controllers, which Nest builds and the kit serves. */
  readonly controllers?: readonly Type<unknown>[];
}

export interface ApplicationOptions extends PlatformOptions {
  /** Who verifies the credential of a request: the real adapter in `main.ts`, a key of their own in the tests. */
  readonly authenticator: Authenticator;
}

/** Wires one context on the platform. An application hosts all of them here, one alone in `apps/<context>/main.ts`. */
type ContextModule = (platform: Platform) => ContextWiring;

export const everyContext: readonly ContextModule[] = [
  // ddd-ts-kit:contexts
  identityModule,
  dataProtectionModule,
  creditPolicyModule,
  creditScoringModule,
  brokerageModule,
  customerDueDiligenceModule,
  branchNetworkModule,
  creditApplicationModule,
  servicingModule,
  financialCrimeModule,
  reportingModule,
  // /ddd-ts-kit:contexts
];

/**
 * The contexts run as services of their own (`ddd-ts-kit generate service`): the application
 * `main.ts` and the worker run leaves them out, since their consumers, their processes and their
 * jobs belong to the service, not to both.
 */
const extracted: readonly ContextModule[] = [
  // ddd-ts-kit:extracted
  servicingModule,
  // /ddd-ts-kit:extracted
];

/**
 * What the application of `main.ts` and the worker host: every context but the extracted ones.
 * `everyContext` stays the full list, the default of the tools, the contracts and the end-to-end
 * tests, which see the whole system in one process.
 */
export const hostedContexts: readonly ContextModule[] = everyContext.filter((module) => !extracted.includes(module));

export interface Application {
  readonly routes: readonly Route[];
  /** Authenticates every request and runs it inside the execution scope. */
  readonly boundary: HttpBoundary;
  /** The Nest controllers of the contexts: their routes are among `routes`, Nest builds them with the buses they inject. */
  readonly controllers: NestControllers;
  /** The routes that answer the signed links of a storage the application serves itself; mounted before any body parser. */
  readonly fileRoutes: readonly Route[];
  /** The provider integration events are delivered to. */
  readonly eventBus: IntegrationEventPublisher;
  /** Where another context, or a test, listens to what this application publishes. */
  readonly eventSubscriber: IntegrationEventSubscriber;
  readonly logger: Logger;
  /** What the HTTP server asks before anything else: on the Redis protocol server, or in the memory of the process without one. */
  readonly rateLimiter: RateLimiter;

  /** Whether what the application depends on answers: the readiness probe of the HTTP server. */
  ready(): Promise<boolean>;

  readonly platform: Platform;

  start(): Promise<void>;

  stop(): Promise<void>;
}

/** Wires every bounded context on the shared platform. Also used to generate the contracts and by the end-to-end tests. */
export function composeApplication(
  persistence: Persistence,
  options: ApplicationOptions,
  selection: readonly ContextModule[] = everyContext,
): Application {
  const platform = createPlatform(persistence, options);
  const { logger, metrics, cache, clock } = platform;

  installAspectRuntime({ logger, metrics, cache, clock });
  registerPlatformJobs(platform, options);

  const contexts = [...selection, auditModule].map((module) => module(platform));

  platform.protection.declare(contexts.flatMap((context) => context.useCases));
  const controllers = controllersOf(contexts, platform);
  // What the server answers in and which fields each caller sees: the forms and the contract are given the same.
  const presentation = presentationOf(platform.access, clock);

  return {
    routes: withForms(defineRoutes(...contexts.map((context) => context.routes), controllers.routes), presentation),
    controllers,
    boundary: boundaryOf(platform, options, presentation),
    fileRoutes: fileRoutes(platform.files.storage),
    eventBus: platform.eventBus,
    // Behind a broker a listener has queues of its own, under its own name.
    eventSubscriber: platform.subscriberFor('observer'),
    logger,
    rateLimiter: platform.rateLimiter,
    ready: () => options.redis?.ready() ?? Promise.resolve(true),
    platform,
    start: () => start(platform, options),
    stop: () => stop(platform, options),
  };
}

/** Who calls, in which scope, and how a refusal or an error is answered, at the edge of the HTTP server. */
function boundaryOf(platform: Platform, options: ApplicationOptions, presentation: Presentation): HttpBoundary {
  return httpBoundary({
    authenticator: options.authenticator,
    executionScope: platform.scope,
    errorMapper: platformErrorMapper(),
    clock: platform.clock,
    logger: platform.logger,
    refusals: platform.audit.refusals,
    errors: platform.errors,
    presentation,
  });
}

/**
 * The consumers first, then the jobs: a job sends commands whose events must find their handlers.
 * The worker of the background jobs runs in the process that runs the jobs.
 */
async function start(platform: Platform, options: ApplicationOptions): Promise<void> {
  await relateSystemActors();

  // The audit trail listens to every declared integration event, under a name of its own.
  subscribeAll(platform.subscriberFor(platform.audit.consumer), platform.audit.subscriptions);
  await options.events.start();

  if (options.jobs?.start === true) {
    await platform.jobs.start();
    await platform.backgroundJobs.start();
  }
}

/**
 * The jobs first, the worker next (a job may still enqueue), then the provider; what failed on the
 * way is given two seconds to reach the tracker; the logger last, flushed by hand since nothing here
 * does it: whatever logs has closed before, and nothing may log after `stop()` returned.
 */
async function stop(platform: Platform, options: ApplicationOptions): Promise<void> {
  await platform.jobs.stop();
  await platform.backgroundJobs.stop();
  await options.events.close();
  await platform.errors.flush(2_000);
  await platform.logger.flush();
}

/** The jobs of the platform itself, run by the whole application: a service passes `platformJobs: false`. */
function registerPlatformJobs(platform: Platform, options: ApplicationOptions): void {
  if (options.platformJobs === false) {
    return;
  }

  purgeStagedFiles(platform);
  archiveAuditEntries(platform);
  purgeExpiredEveryNight(platform);
}

/** What rolled-back commands left in `staging/`, removed every hour by the process that runs the jobs. */
function purgeStagedFiles(platform: Platform): void {
  const purge = new PurgeStagedFiles(platform.files.staging, platform.clock);

  platform.jobs.register({ name: 'files.purge-staged', schedule: { every: '1h' }, run: () => purge.run() });
}

/**
 * The entries of the audit trail older than the twelve whole months it keeps online, moved to the
 * storage on the first day of every month at 04:00 UTC, verified and anchored.
 */
function archiveAuditEntries(platform: Platform): void {
  const archive = new ArchiveAuditEntries(platform.audit.trail, platform.files.storage, platform.clock);

  platform.jobs.register({ name: 'audit.archive', schedule: { cron: '0 4 1 * *' }, run: () => archive.run() });
}

/** What outlived the retention its declaration gives, purged every night at 03:00 UTC by the process that runs the jobs. */
function purgeExpiredEveryNight(platform: Platform): void {
  platform.jobs.register({
    name: 'privacy.purge-expired',
    schedule: { cron: '0 3 * * *' },
    run: async () => {
      await runPurge(platform);
    },
  });
}

/** The Nest controllers of the contexts: their routes now, their instances built by Nest when the server starts, with the buses of the platform. */
function controllersOf(contexts: readonly ContextWiring[], platform: Platform): NestControllers {
  return nestControllers(
    contexts.flatMap((context) => context.controllers ?? []),
    {
      providers: [
        { provide: CommandBus, useValue: platform.commands },
        { provide: QueryBus, useValue: platform.queries },
      ],
      // A DTO without a decorated field yet accepts the empty object alone: whitelist and forbidNonWhitelisted refuse any field.
      schemaOfClass: (dto) => classSchema(dto, { validator: { forbidUnknownValues: false } }),
    },
  );
}
