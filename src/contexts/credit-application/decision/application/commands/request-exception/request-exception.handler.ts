import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import type { RequestExceptionCommand } from '@/contexts/credit-application/decision/application/commands/request-exception/request-exception.command';
import type { DeciderLimitReader } from '@/contexts/credit-application/decision/application/projections/decider-limit-reader.projection';
import type { DeclaredConflictsStore } from '@/contexts/credit-application/decision/application/ports/declared-conflicts-store.port';
import { ExceptionLevelService } from '@/contexts/credit-application/decision/domain/services/exception-level.service';
import { UnknownCreditApplication } from '@/contexts/credit-application/file/domain/errors/unknown-credit-application.error';

/**
 * Asks for an exception on an application: the level above the one the amount needs decides it. The application must be
 * assessed and not decided, and holds one exception at a time; the file records the request.
 */
export class RequestExceptionHandler implements CommandHandler<RequestExceptionCommand> {
  constructor(
    private readonly creditApplicationRepository: CreditApplicationRepository,
    private readonly deciderLimits: DeciderLimitReader,
    private readonly clock: Clock,
    private readonly declaredConflicts: DeclaredConflictsStore,
  ) {}

  async execute(command: RequestExceptionCommand): Promise<void> {
    const creditApplication = await this.creditApplicationRepository.findById(command.applicationId);

    if (creditApplication === undefined) {
      throw UnknownCreditApplication.forCreditApplication(command.applicationId);
    }

    const requestedAt = this.clock.now();
    const limit = await this.deciderLimits.readFor(command.actor.id, requestedAt);
    const conflictedIds = await this.conflictedStaffMembersOf(creditApplication.applicantId);

    const targetLevel = new ExceptionLevelService().of({
      deciderId: command.actor.id,
      level: limit.level,
      amountCents: creditApplication.amount.cents,
      levels: limit.levels,
      preparerIds: creditApplication.preparerIds,
      conflictedIds,
    });

    creditApplication.requestException({
      requesterId: command.actor.id,
      targetLevel,
      justification: command.justification,
      requestedAt,
    });

    await this.creditApplicationRepository.save(creditApplication);
  }

  /** The staff members who declared a conflict of interest on the applicant: none of them may ask for an exception. */
  private async conflictedStaffMembersOf(applicantId: string): Promise<readonly string[]> {
    const conflicts = await this.declaredConflicts.searchOfCustomer(applicantId);

    return conflicts.map((conflict) => conflict.staffMemberId);
  }
}
