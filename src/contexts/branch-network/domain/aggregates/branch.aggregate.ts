import { AggregateRoot } from '@ddd-ts-kit/kernel';
import { BranchOpened } from '@/contexts/branch-network/domain/events/branch-opened.event';

export interface BranchState {
  readonly registeredAt: Date;
}

export class Branch extends AggregateRoot<string> {
  private constructor(
    id: string,
    private state: BranchState,
  ) {
    super(id);
  }

  static create(id: string, now: Date): Branch {
    const opened = new Branch(id, { registeredAt: now });

    opened.record(new BranchOpened(id, now));

    return opened;
  }

  static rehydrate(id: string, state: BranchState): Branch {
    return new Branch(id, state);
  }

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  toState(): BranchState {
    return { ...this.state };
  }
}
