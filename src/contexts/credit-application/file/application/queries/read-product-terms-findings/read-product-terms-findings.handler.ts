import type { QueryHandler } from '@ddd-ts-kit/kernel';
import { UnknownCreditApplication } from '@/contexts/credit-application/file/domain/errors/unknown-credit-application.error';
import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import type { ReadProductTermsFindingsQuery } from '@/contexts/credit-application/file/application/queries/read-product-terms-findings/read-product-terms-findings.query';
import type { ReadProductTermsFindingsResult } from '@/contexts/credit-application/file/application/queries/read-product-terms-findings/read-product-terms-findings.result';

export class ReadProductTermsFindingsHandler implements QueryHandler<ReadProductTermsFindingsQuery> {
  constructor(private readonly creditApplicationRepository: CreditApplicationRepository) {}

  async execute(query: ReadProductTermsFindingsQuery): Promise<ReadProductTermsFindingsResult> {
    const creditApplication = await this.creditApplicationRepository.findById(query.applicationId);

    if (creditApplication === undefined) {
      throw UnknownCreditApplication.forCreditApplication(query.applicationId);
    }

    return { findings: creditApplication.toState().productTermsFindings };
  }
}
