import { NamedDomainEvent } from '@ddd-ts-kit/kernel';
import type { OutsideProductLimit } from '@/contexts/credit-application/file/domain/values/product-terms-finding';

/** The check of the application found its request outside a limit of its product: the limit it breaks is kept with the fact. */
export class CreditApplicationRequestFoundOutsideProductTerms extends NamedDomainEvent(
  'credit-application.credit-application.request-found-outside-product-terms',
) {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly finding: OutsideProductLimit,
  ) {
    super();
  }
}
