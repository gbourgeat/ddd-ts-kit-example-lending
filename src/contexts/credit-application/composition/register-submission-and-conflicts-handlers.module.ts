import type { Platform } from '@/platform/composition/platform';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import type { DeclaredConflictsStore } from '@/contexts/credit-application/decision/application/ports/declared-conflicts-store.port';
import type { CustomerAdvisorBranchGateway } from '@/contexts/credit-application/file/application/ports/customer-advisor-branch-gateway.port';
import { SubmitApplicationCommand } from '@/contexts/credit-application/file/application/commands/submit-application/submit-application.command';
import { SubmitApplicationHandler } from '@/contexts/credit-application/file/application/commands/submit-application/submit-application.handler';
import { ReadDeclaredConflictsQuery } from '@/contexts/credit-application/decision/application/queries/read-declared-conflicts/read-declared-conflicts.query';
import { ReadDeclaredConflictsHandler } from '@/contexts/credit-application/decision/application/queries/read-declared-conflicts/read-declared-conflicts.handler';

/** The submission of an application and the reading of its declared conflicts, over the repository and stores the module binds. */
export function registerSubmissionAndConflictsHandlers(
  platform: Platform,
  ports: {
    readonly repository: CreditApplicationRepository;
    readonly declaredConflicts: DeclaredConflictsStore;
    readonly customerAdvisorBranch: CustomerAdvisorBranchGateway;
  },
): void {
  platform.commands.register(
    SubmitApplicationCommand,
    new SubmitApplicationHandler(ports.repository, platform.ids, platform.clock, ports.customerAdvisorBranch),
    { context: 'credit-application' },
  );

  platform.queries.register(
    ReadDeclaredConflictsQuery,
    new ReadDeclaredConflictsHandler(ports.declaredConflicts, ports.repository),
    { context: 'credit-application' },
  );
}
