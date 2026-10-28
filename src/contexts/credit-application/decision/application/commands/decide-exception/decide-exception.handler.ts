import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import type { DecideExceptionCommand } from '@/contexts/credit-application/decision/application/commands/decide-exception/decide-exception.command';
import type { DeciderLimitReader } from '@/contexts/credit-application/decision/application/projections/decider-limit-reader.projection';
import type { DeclaredConflictsStore } from '@/contexts/credit-application/decision/application/ports/declared-conflicts-store.port';
import { ExceptionDecisionLimitService } from '@/contexts/credit-application/decision/domain/services/exception-decision-limit.service';
import { UnknownCreditApplication } from '@/contexts/credit-application/file/domain/errors/unknown-credit-application.error';

/**
 * The credit committee decides the exception requested on an application: the decider must sit at the committee level, not
 * prepare the file and not be conflicted. The outcome is recorded on the file, and an approval lets its requester decide.
 */
export class DecideExceptionHandler implements CommandHandler<DecideExceptionCommand> {
  constructor(
    private readonly creditApplicationRepository: CreditApplicationRepository,
    private readonly deciderLimits: DeciderLimitReader,
    private readonly clock: Clock,
    private readonly declaredConflicts: DeclaredConflictsStore,
  ) {}

  async execute(command: DecideExceptionCommand): Promise<void> {
    const creditApplication = await this.creditApplicationRepository.findById(command.applicationId);

    if (creditApplication === undefined) {
      throw UnknownCreditApplication.forCreditApplication(command.applicationId);
    }

    const decidedAt = this.clock.now();
    const limit = await this.deciderLimits.readFor(command.actor.id, decidedAt);
    const conflictedIds = await this.conflictedStaffMembersOf(creditApplication.applicantId);

    new ExceptionDecisionLimitService().check({
      deciderId: command.actor.id,
      level: limit.level,
      preparerIds: creditApplication.preparerIds,
      conflictedIds,
    });

    creditApplication.decideException({
      deciderId: command.actor.id,
      outcome: command.decision.outcome,
      reasons: command.decision.reasons,
      decidedAt,
    });

    await this.creditApplicationRepository.save(creditApplication);
  }

  /** The staff members who declared a conflict of interest on the applicant: none of them may decide the exception. */
  private async conflictedStaffMembersOf(applicantId: string): Promise<readonly string[]> {
    const conflicts = await this.declaredConflicts.searchOfCustomer(applicantId);

    return conflicts.map((conflict) => conflict.staffMemberId);
  }
}
