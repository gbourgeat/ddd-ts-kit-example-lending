import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

export class DelegationTablePublished extends NamedDomainEvent('credit-policy.delegation-table.published') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly publication: {
      readonly effectiveFrom: Date;
      readonly levels: readonly { readonly level: string; readonly amountCents: number }[];
    },
  ) {
    super();
  }
}
