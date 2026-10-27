import { NamedDomainEvent } from '@ddd-ts-kit/kernel';

export class PortfolioOpened extends NamedDomainEvent('branch-network.portfolio.opened') {
  constructor(
    readonly aggregateId: string,
    readonly occurredAt: Date,
  ) {
    super();
  }
}
