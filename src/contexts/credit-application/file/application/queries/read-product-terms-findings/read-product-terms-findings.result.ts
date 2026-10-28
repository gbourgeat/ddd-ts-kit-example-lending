import type { ProductTermsFinding } from '@/contexts/credit-application/file/domain/values/product-terms-finding';

/** The findings of the checks against the product, in the order they were recorded: none when the request was within its limits. */
export interface ReadProductTermsFindingsResult {
  readonly findings: readonly ProductTermsFinding[];
}
