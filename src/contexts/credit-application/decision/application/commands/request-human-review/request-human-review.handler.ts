import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import type { RequestHumanReviewCommand } from '@/contexts/credit-application/decision/application/commands/request-human-review/request-human-review.command';
import { UnknownCreditApplication } from '@/contexts/credit-application/file/domain/errors/unknown-credit-application.error';

/** The applicant's request is recorded on the file: a person reviews the refusal that stands on the application. */
export class RequestHumanReviewHandler implements CommandHandler<RequestHumanReviewCommand> {
  constructor(
    private readonly creditApplicationRepository: CreditApplicationRepository,
    private readonly clock: Clock,
  ) {}

  async execute(command: RequestHumanReviewCommand): Promise<void> {
    const creditApplication = await this.creditApplicationRepository.findById(command.applicationId);

    if (creditApplication === undefined) {
      throw UnknownCreditApplication.forCreditApplication(command.applicationId);
    }

    creditApplication.requestHumanReview({ requesterId: command.actor.id, requestedAt: this.clock.now() });

    await this.creditApplicationRepository.save(creditApplication);
  }
}
