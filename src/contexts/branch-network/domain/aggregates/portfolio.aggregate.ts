import { AggregateRoot } from '@ddd-ts-kit/kernel';
import { PortfolioOpened } from '@/contexts/branch-network/domain/events/portfolio-opened.event';

export interface PortfolioState {
  readonly registeredAt: Date;
  readonly advisorId: string;
  readonly branchId: string;
}

export class Portfolio extends AggregateRoot<string> {
  private constructor(
    id: string,
    private state: PortfolioState,
  ) {
    super(id);
  }

  static create(id: string, advisorId: string, branchId: string, now: Date): Portfolio {
    const opened = new Portfolio(id, { registeredAt: now, advisorId, branchId });

    opened.record(new PortfolioOpened(id, now));

    return opened;
  }

  static rehydrate(id: string, state: PortfolioState): Portfolio {
    return new Portfolio(id, state);
  }

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  get advisorId(): string {
    return this.state.advisorId;
  }

  get branchId(): string {
    return this.state.branchId;
  }

  toState(): PortfolioState {
    return { ...this.state };
  }
}
