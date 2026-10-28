import type { Platform } from '@/platform/composition/platform';
import type { ProductTerms } from '@/contexts/credit-application/file/application/ports/product-terms.port';
import { KeepProductTermsCommand } from '@/contexts/credit-application/file/application/commands/keep-product-terms/keep-product-terms.command';
import { KeepProductTermsHandler } from '@/contexts/credit-application/file/application/commands/keep-product-terms/keep-product-terms.handler';
import { ReadProductTermsQuery } from '@/contexts/credit-application/file/application/queries/read-product-terms/read-product-terms.query';
import { ReadProductTermsHandler } from '@/contexts/credit-application/file/application/queries/read-product-terms/read-product-terms.handler';

/** The command that keeps the product terms and the query that reads them, over the read model the module binds. */
export function registerProductTermsHandlers(platform: Platform, productTerms: ProductTerms): void {
  platform.commands.register(KeepProductTermsCommand, new KeepProductTermsHandler(productTerms), {
    context: 'credit-application',
  });

  platform.queries.register(ReadProductTermsQuery, new ReadProductTermsHandler(productTerms), {
    context: 'credit-application',
  });
}
