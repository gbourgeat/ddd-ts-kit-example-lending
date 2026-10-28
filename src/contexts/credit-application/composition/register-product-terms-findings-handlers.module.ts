import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import { ReadProductTermsFindingsQuery } from '@/contexts/credit-application/file/application/queries/read-product-terms-findings/read-product-terms-findings.query';
import { ReadProductTermsFindingsHandler } from '@/contexts/credit-application/file/application/queries/read-product-terms-findings/read-product-terms-findings.handler';
import type { Platform } from '@/platform/composition/platform';

/** The query that reads the findings of an application, over the repository the module binds. */
export function registerProductTermsFindingsHandlers(
  platform: Platform,
  repository: CreditApplicationRepository,
): void {
  platform.queries.register(ReadProductTermsFindingsQuery, new ReadProductTermsFindingsHandler(repository), {
    context: 'credit-application',
  });
}
