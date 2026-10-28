import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import type { ContestDecisionCommand } from '@/contexts/credit-application/decision/application/commands/contest-decision/contest-decision.command';
import { UnknownCreditApplication } from '@/contexts/credit-application/file/domain/errors/unknown-credit-application.error';

/** The applicant's contestation is recorded on the file, once: a person reviews the decision it contests. */
export class ContestDecisionHandler implements CommandHandler<ContestDecisionCommand> {
  constructor(
    private readonly creditApplicationRepository: CreditApplicationRepository,
    private readonly clock: Clock,
  ) {}

  async execute(command: ContestDecisionCommand): Promise<void> {
    const creditApplication = await this.creditApplicationRepository.findById(command.applicationId);

    if (creditApplication === undefined) {
      throw UnknownCreditApplication.forCreditApplication(command.applicationId);
    }

    creditApplication.contest({
      requesterId: command.actor.id,
      reason: command.reason,
      contestedAt: this.clock.now(),
    });

    await this.creditApplicationRepository.save(creditApplication);
  }
}
