import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import type { DecideReschedulingCommand } from '@/contexts/credit-application/decision/application/commands/decide-rescheduling/decide-rescheduling.command';
import type { DeciderLimitReader } from '@/contexts/credit-application/decision/application/projections/decider-limit-reader.projection';
import type { DeclaredConflictsStore } from '@/contexts/credit-application/decision/application/ports/declared-conflicts-store.port';
import { DecisionLimitService } from '@/contexts/credit-application/decision/domain/services/decision-limit.service';
import { ExceptionLimitService } from '@/contexts/credit-application/decision/domain/services/exception-limit.service';
import { UnknownCreditApplication } from '@/contexts/credit-application/file/domain/errors/unknown-credit-application.error';

/**
 * Decides a rescheduling of an approved application as a credit: the decider's limit on the outstanding amount, the preparer
 * rule and the declared conflicts are checked, then the file records the rescheduling.
 */
export class DecideReschedulingHandler implements CommandHandler<DecideReschedulingCommand> {
  constructor(
    private readonly creditApplicationRepository: CreditApplicationRepository,
    private readonly deciderLimits: DeciderLimitReader,
    private readonly clock: Clock,
    private readonly declaredConflicts: DeclaredConflictsStore,
  ) {}

  async execute(command: DecideReschedulingCommand): Promise<void> {
    const creditApplication = await this.creditApplicationRepository.findById(command.applicationId);

    if (creditApplication === undefined) {
      throw UnknownCreditApplication.forCreditApplication(command.applicationId);
    }

    const decidedAt = this.clock.now();
    const limit = await this.deciderLimits.readFor(command.actor.id, decidedAt);
    const conflicts = await this.declaredConflicts.searchOfCustomer(creditApplication.applicantId);

    new DecisionLimitService().check({
      deciderId: command.actor.id,
      level: limit.level,
      amountCents: command.outstandingAmountCents,
      levels: limit.levels,
      preparerIds: creditApplication.preparerIds,
      conflictedIds: conflicts.map((conflict) => conflict.staffMemberId),
      exceptionApproved: new ExceptionLimitService().lifts(command.actor.id, creditApplication.toState()),
    });

    creditApplication.decideRescheduling({
      deciderId: command.actor.id,
      level: limit.level,
      durationMonths: command.durationMonths,
      outstandingAmountCents: command.outstandingAmountCents,
      decidedAt,
    });

    await this.creditApplicationRepository.save(creditApplication);
  }
}
