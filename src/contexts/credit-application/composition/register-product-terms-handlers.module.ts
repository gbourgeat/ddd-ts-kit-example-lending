import type { CreditApplicationRepository } from '@/contexts/credit-application/file/domain/repositories/credit-application.repository';
import { registerCheckRequestAgainstProductHandlers } from '@/contexts/credit-application/composition/register-check-request-against-product-handlers.module';
import { registerProductTermsFindingsHandlers } from '@/contexts/credit-application/composition/register-product-terms-findings-handlers.module';
import type { Platform } from '@/platform/composition/platform';
import type { ProductTerms } from '@/contexts/credit-application/file/application/ports/product-terms.port';
import { KeepProductTermsCommand } from '@/contexts/credit-application/file/application/commands/keep-product-terms/keep-product-terms.command';
import { KeepProductTermsHandler } from '@/contexts/credit-application/file/application/commands/keep-product-terms/keep-product-terms.handler';
import { ReadProductTermsQuery } from '@/contexts/credit-application/file/application/queries/read-product-terms/read-product-terms.query';
import { ReadProductTermsHandler } from '@/contexts/credit-application/file/application/queries/read-product-terms/read-product-terms.handler';

/** The product terms (kept and read), the check of a request against them and the findings it leaves, over the read model the module binds. */
export function registerProductTermsHandlers(
  platform: Platform,
  productTerms: ProductTerms,
  repository: CreditApplicationRepository,
): void {
  registerCheckRequestAgainstProductHandlers(platform, repository, productTerms);
  registerProductTermsFindingsHandlers(platform, repository);

  platform.commands.register(KeepProductTermsCommand, new KeepProductTermsHandler(productTerms), {
    context: 'credit-application',
  });

  platform.queries.register(ReadProductTermsQuery, new ReadProductTermsHandler(productTerms), {
    context: 'credit-application',
  });
}
