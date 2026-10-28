import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import type {
  DecideApplicationCommand,
  DecisionRequest,
} from '@/contexts/credit-application/decision/application/commands/decide-application/decide-application.command';
import type { DeciderLimitReader } from '@/contexts/credit-application/decision/application/projections/decider-limit-reader.projection';
import type { DeclaredConflictsStore } from '@/contexts/credit-application/decision/application/ports/declared-conflicts-store.port';
import { DecisionLimitService } from '@/contexts/credit-application/decision/domain/services/decision-limit.service';
import { DecisionOutcome } from '@/contexts/credit-application/decision/domain/vocabularies/decision-outcome.vocabulary';
import { UnknownCreditApplication } from '@/contexts/credit-application/file/domain/errors/unknown-credit-application.error';

/**
 * Decides an application: the decider's limit, the preparer rule and the declared conflicts are checked, then the file
 * records the decision.
 */
export class DecideApplicationHandler implements CommandHandler<DecideApplicationCommand> {
  constructor(
    private readonly creditApplicationRepository: CreditApplicationRepository,
    private readonly deciderLimits: DeciderLimitReader,
    private readonly clock: Clock,
    private readonly declaredConflicts: DeclaredConflictsStore,
  ) {}

  async execute(command: DecideApplicationCommand): Promise<string> {
    const creditApplication = await this.creditApplicationRepository.findById(command.applicationId);

    if (creditApplication === undefined) {
      throw UnknownCreditApplication.forCreditApplication(command.applicationId);
    }

    const decidedAt = this.clock.now();
    const limit = await this.deciderLimits.readFor(command.actor.id, decidedAt);
    const approvedAmountCents = this.approvedAmountOf(command.decision, creditApplication.amount.cents);
    const conflictedIds = await this.conflictedStaffMembersOf(creditApplication.applicantId);

    new DecisionLimitService().check({
      deciderId: command.actor.id,
      level: limit.level,
      amountCents: approvedAmountCents,
      levels: limit.levels,
      preparerIds: creditApplication.preparerIds,
      conflictedIds,
    });

    creditApplication.decide({
      deciderId: command.actor.id,
      level: limit.level,
      outcome: command.decision.outcome,
      reasons: command.decision.reasons,
      conditions: command.decision.conditions,
      approvedAmountCents,
      decidedAt,
    });

    await this.creditApplicationRepository.save(creditApplication);

    return creditApplication.id;
  }

  /** The staff members who declared a conflict of interest on the applicant: none of them may decide the application. */
  private async conflictedStaffMembersOf(applicantId: string): Promise<readonly string[]> {
    const conflicts = await this.declaredConflicts.searchOfCustomer(applicantId);

    return conflicts.map((conflict) => conflict.staffMemberId);
  }

  /** A refusal approves nothing, an approval without conditions approves the requested amount, a conditional one its lower amount. */
  private approvedAmountOf(decision: DecisionRequest, requestedCents: number): number {
    if (decision.outcome === DecisionOutcome.Refuse) {
      return 0;
    }

    return decision.outcome === DecisionOutcome.Approve ? requestedCents : decision.approvedAmountCents;
  }
}
