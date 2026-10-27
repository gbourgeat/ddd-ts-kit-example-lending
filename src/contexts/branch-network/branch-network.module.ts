import type { UseCaseDeclaration } from '@ddd-ts-kit/auth';
import type { Type } from '@nestjs/common';
import { branchNetworkControllers } from '@/contexts/branch-network/branch-network.controllers';
import type { Route } from '@ddd-ts-kit/http';
import type { Platform } from '@/platform/composition/platform';
// ddd-ts-kit:imports
import { PrismaBranchRepository } from '@/contexts/branch-network/infrastructure/persistence/prisma-branch.repository';
import { requires } from '@ddd-ts-kit/auth';
import { branchNetworkPermissions } from '@/contexts/branch-network/branch-network.permissions';
import { OpenBranchCommand } from '@/contexts/branch-network/application/commands/open-branch/open-branch.command';
import { OpenBranchHandler } from '@/contexts/branch-network/application/commands/open-branch/open-branch.handler';
import { ConflictOfInterestDeclaredPublisher } from '@/contexts/branch-network/application/integration/publishers/conflict-of-interest-declared.publisher';
import { ConflictOfInterestDeclared } from '@/contexts/branch-network/domain/events/conflict-of-interest-declared.event';
import { StaffMemberAppointedPublisher } from '@/contexts/branch-network/application/integration/publishers/staff-member-appointed.publisher';
import { StaffMemberAppointed } from '@/contexts/branch-network/domain/events/staff-member-appointed.event';
import { PrismaStaffMemberRepository } from '@/contexts/branch-network/infrastructure/persistence/prisma-staff-member.repository';
import { AppointStaffMemberCommand } from '@/contexts/branch-network/application/commands/appoint-staff-member/appoint-staff-member.command';
import { AppointStaffMemberHandler } from '@/contexts/branch-network/application/commands/appoint-staff-member/appoint-staff-member.handler';
import { OpenPortfolioForAdvisorEventHandler } from '@/contexts/branch-network/application/event-handlers/open-portfolio-for-advisor.event-handler';
import { PrismaPortfolioRepository } from '@/contexts/branch-network/infrastructure/persistence/prisma-portfolio.repository';
import { OpenPortfolioCommand } from '@/contexts/branch-network/application/commands/open-portfolio/open-portfolio.command';
import { OpenPortfolioHandler } from '@/contexts/branch-network/application/commands/open-portfolio/open-portfolio.handler';
import { SearchBranchStaffHandler } from '@/contexts/branch-network/application/queries/search-branch-staff/search-branch-staff.handler';
import { SearchBranchStaffQuery } from '@/contexts/branch-network/application/queries/search-branch-staff/search-branch-staff.query';
import { InMemorySearchBranchStaffReader } from '@/contexts/branch-network/infrastructure/persistence/in-memory-search-branch-staff.reader';
import { PrismaConflictOfInterestRepository } from '@/contexts/branch-network/infrastructure/persistence/prisma-conflict-of-interest.repository';
import { DeclareConflictOfInterestCommand } from '@/contexts/branch-network/application/commands/declare-conflict-of-interest/declare-conflict-of-interest.command';
import { DeclareConflictOfInterestHandler } from '@/contexts/branch-network/application/commands/declare-conflict-of-interest/declare-conflict-of-interest.handler';
// /ddd-ts-kit:imports

export interface BranchNetworkWiring {
  readonly name: string;
  readonly useCases: readonly UseCaseDeclaration[];
  readonly routes: readonly Route[];
  /** Its Nest controllers, listed by the generated `branch-network.controllers.ts`: Nest builds them, the kit serves their methods. */
  readonly controllers: readonly Type<unknown>[];
}

export function branchNetworkModule(platform: Platform): BranchNetworkWiring {
  registerHandlers(platform);
  registerReactions(platform);
  registerJobs(platform);

  return {
    name: 'branch-network',
    useCases: declaredUseCases(),
    routes: routesOf(platform),
    controllers: branchNetworkControllers,
  };
}

/** The command and query handlers of the context, with the repositories and readers they are given. */
function registerHandlers(platform: Platform): void {
  // ddd-ts-kit:handlers
  const branchRepository = platform.adapter(
    new PrismaBranchRepository(platform.persistence.database, platform.scope, platform.clock),
    { kind: 'repository', context: 'branch-network', token: 'BranchRepository' },
  );

  platform.commands.register(OpenBranchCommand, new OpenBranchHandler(branchRepository, platform.ids, platform.clock), {
    context: 'branch-network',
  });

  const staffMemberRepository = platform.adapter(
    new PrismaStaffMemberRepository(platform.persistence.database, platform.scope, platform.clock),
    { kind: 'repository', context: 'branch-network', token: 'StaffMemberRepository' },
  );

  platform.commands.register(
    AppointStaffMemberCommand,
    new AppointStaffMemberHandler(branchRepository, staffMemberRepository, platform.ids, platform.clock),
    { context: 'branch-network' },
  );

  const portfolioRepository = platform.adapter(
    new PrismaPortfolioRepository(platform.persistence.database, platform.scope, platform.clock),
    { kind: 'repository', context: 'branch-network', token: 'PortfolioRepository' },
  );

  platform.commands.register(
    OpenPortfolioCommand,
    new OpenPortfolioHandler(portfolioRepository, platform.ids, platform.clock, platform.relations),
    { context: 'branch-network' },
  );

  const searchBranchStaffReader = platform.adapter(new InMemorySearchBranchStaffReader(), {
    kind: 'repository',
    context: 'branch-network',
  });

  platform.queries.register(
    SearchBranchStaffQuery,
    new SearchBranchStaffHandler(searchBranchStaffReader, platform.access),
    { context: 'branch-network' },
  );

  const conflictOfInterestRepository = platform.adapter(
    new PrismaConflictOfInterestRepository(platform.persistence.database, platform.scope, platform.clock),
    { kind: 'repository', context: 'branch-network', token: 'ConflictOfInterestRepository' },
  );

  platform.commands.register(
    DeclareConflictOfInterestCommand,
    new DeclareConflictOfInterestHandler(
      conflictOfInterestRepository,
      staffMemberRepository,
      platform.ids,
      platform.clock,
    ),
    { context: 'branch-network' },
  );
  // /ddd-ts-kit:handlers
}

/** What the context does when an event happens: its own events and those of the other contexts. */
function registerReactions(platform: Platform): void {
  // ddd-ts-kit:reactions
  const conflictOfInterestDeclaredPublisher = platform.adapter(
    new ConflictOfInterestDeclaredPublisher(platform.publisher, platform.ids),
    { kind: 'domain-event-handler', context: 'branch-network' },
  );

  platform.domainEvents.on(ConflictOfInterestDeclared.eventName, async (event) => {
    if (event instanceof ConflictOfInterestDeclared) {
      await conflictOfInterestDeclaredPublisher.handle(event);
    }
  });

  const staffMemberAppointedPublisher = platform.adapter(
    new StaffMemberAppointedPublisher(platform.publisher, platform.ids),
    { kind: 'domain-event-handler', context: 'branch-network' },
  );

  platform.domainEvents.on(StaffMemberAppointed.eventName, async (event) => {
    if (event instanceof StaffMemberAppointed) {
      await staffMemberAppointedPublisher.handle(event);
    }
  });

  const staffMemberRepositoryOfReaction = platform.adapter(
    new PrismaStaffMemberRepository(platform.persistence.database, platform.scope, platform.clock),
    { kind: 'repository', context: 'branch-network', token: 'StaffMemberRepository' },
  );

  const openPortfolioForAdvisorEventHandler = platform.adapter(
    new OpenPortfolioForAdvisorEventHandler(staffMemberRepositoryOfReaction, platform.commands),
    { kind: 'domain-event-handler', context: 'branch-network' },
  );

  platform.domainEvents.on(StaffMemberAppointed.eventName, async (event) => {
    if (event instanceof StaffMemberAppointed) {
      await openPortfolioForAdvisorEventHandler.handle(event);
    }
  });
  // /ddd-ts-kit:reactions
}

/** The jobs of the context, scheduled and in the background. */
function registerJobs(platform: Platform): void {
  // ddd-ts-kit:jobs
  // /ddd-ts-kit:jobs
}

/** What each use case requires, or that it is public. */
function declaredUseCases(): UseCaseDeclaration[] {
  return [
    // ddd-ts-kit:authorization
    requires(OpenBranchCommand, branchNetworkPermissions['branch.open'], {
      resource: () => ({ type: 'context', id: 'branch-network' }),
    }),
    requires(AppointStaffMemberCommand, branchNetworkPermissions['staff-member.appoint'], {
      resource: () => ({ type: 'context', id: 'branch-network' }),
    }),
    requires(OpenPortfolioCommand, branchNetworkPermissions['portfolio.open'], {
      resource: () => ({ type: 'context', id: 'branch-network' }),
    }),
    requires(SearchBranchStaffQuery, branchNetworkPermissions['staff-member.list'], {
      resource: (query) => ({ type: 'branch', id: query.branchId }),
    }),
    requires(DeclareConflictOfInterestCommand, branchNetworkPermissions['conflict.declare'], {
      resource: () => ({ type: 'context', id: 'branch-network' }),
    }),
    // /ddd-ts-kit:authorization
  ];
}

/** The routes the context answers, over the buses of the platform. */
function routesOf(platform: Platform): Route[] {
  return [
    // ddd-ts-kit:routes
    // /ddd-ts-kit:routes
  ];
}
