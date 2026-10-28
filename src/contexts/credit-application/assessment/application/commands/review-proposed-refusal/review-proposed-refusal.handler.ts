import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import type { ReviewProposedRefusalCommand } from '@/contexts/credit-application/assessment/application/commands/review-proposed-refusal/review-proposed-refusal.command';
import { UnknownCreditApplication } from '@/contexts/credit-application/file/domain/errors/unknown-credit-application.error';

export class ReviewProposedRefusalHandler implements CommandHandler<ReviewProposedRefusalCommand> {
  constructor(
    private readonly creditApplicationRepository: CreditApplicationRepository,
    private readonly clock: Clock,
  ) {}

  async execute(command: ReviewProposedRefusalCommand): Promise<string> {
    const creditApplication = await this.creditApplicationRepository.findById(command.applicationId);

    if (creditApplication === undefined) {
      throw UnknownCreditApplication.forCreditApplication(command.applicationId);
    }

    creditApplication.reviewProposedRefusal({
      reviewerId: command.actor.id,
      conclusion: command.review.conclusion,
      reason: command.review.reason,
      reviewedAt: this.clock.now(),
    });

    await this.creditApplicationRepository.save(creditApplication);

    return creditApplication.id;
  }
}
