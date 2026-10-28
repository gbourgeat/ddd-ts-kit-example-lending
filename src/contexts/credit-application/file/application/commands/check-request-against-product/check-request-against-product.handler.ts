import type { Clock, CommandHandler } from '@ddd-ts-kit/kernel';
import { UnknownCreditApplication } from '@/contexts/credit-application/file/domain/errors/unknown-credit-application.error';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import type { ProductTerms } from '@/contexts/credit-application/file/application/ports/product-terms.port';
import type { CheckRequestAgainstProductCommand } from '@/contexts/credit-application/file/application/commands/check-request-against-product/check-request-against-product.command';

/** Checks the application against the terms of its product: the findings are kept in its file, the submission is never refused. */
export class CheckRequestAgainstProductHandler implements CommandHandler<CheckRequestAgainstProductCommand> {
  constructor(
    private readonly creditApplicationRepository: CreditApplicationRepository,
    private readonly productTerms: ProductTerms,
    private readonly clock: Clock,
  ) {}

  async execute(command: CheckRequestAgainstProductCommand): Promise<string> {
    const creditApplication = await this.creditApplicationRepository.findById(command.applicationId);

    if (creditApplication === undefined) {
      throw UnknownCreditApplication.forCreditApplication(command.applicationId);
    }

    const terms = await this.productTerms.get(creditApplication.toState().productId);

    creditApplication.checkAgainstProductTerms(terms, this.clock.now());

    await this.creditApplicationRepository.save(creditApplication);

    return creditApplication.id;
  }
}
