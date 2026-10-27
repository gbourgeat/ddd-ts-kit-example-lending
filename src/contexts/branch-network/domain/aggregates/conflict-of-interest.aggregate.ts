import { AggregateRoot } from '@ddd-ts-kit/kernel';
import { ConflictOfInterestDeclared } from '@/contexts/branch-network/domain/events/conflict-of-interest-declared.event';

export interface ConflictOfInterestState {
  readonly registeredAt: Date;
  readonly staffMemberId: string;
  readonly customerId: string;
}

export class ConflictOfInterest extends AggregateRoot<string> {
  private constructor(
    id: string,
    private state: ConflictOfInterestState,
  ) {
    super(id);
  }

  static create(id: string, staffMemberId: string, customerId: string, now: Date): ConflictOfInterest {
    const declared = new ConflictOfInterest(id, { registeredAt: now, staffMemberId, customerId });

    declared.record(new ConflictOfInterestDeclared(id, staffMemberId, customerId, now));

    return declared;
  }

  static rehydrate(id: string, state: ConflictOfInterestState): ConflictOfInterest {
    return new ConflictOfInterest(id, state);
  }

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  get staffMemberId(): string {
    return this.state.staffMemberId;
  }

  get customerId(): string {
    return this.state.customerId;
  }

  toState(): ConflictOfInterestState {
    return { ...this.state };
  }
}
