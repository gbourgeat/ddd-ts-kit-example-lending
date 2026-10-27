import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

export class ResidualIncomeMinimumPublished extends NamedDomainEvent(
  'credit-policy.residual-income-minimum.published',
) {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
  ) {
    super();
  }
}
