import { AggregateRoot } from '@ddd-ts-kit/kernel';
import { StaffMemberAppointed } from '@/contexts/branch-network/domain/events/staff-member-appointed.event';

export interface StaffMemberState {
  readonly registeredAt: Date;
  readonly branchId: string;
  readonly name: string;
  readonly email: string;
  readonly accountId: string;
  readonly ownCustomerId: string | undefined;
}

export interface StaffMemberAppointment {
  readonly branchId: string;
  readonly name: string;
  readonly email: string;
  readonly accountId: string;
  readonly ownCustomerId: string | undefined;
}

export class StaffMember extends AggregateRoot<string> {
  private constructor(
    id: string,
    private state: StaffMemberState,
  ) {
    super(id);
  }

  static create(id: string, appointment: StaffMemberAppointment, now: Date): StaffMember {
    const appointed = new StaffMember(id, { registeredAt: now, ...appointment });

    appointed.record(new StaffMemberAppointed(id, now));

    return appointed;
  }

  static rehydrate(id: string, state: StaffMemberState): StaffMember {
    return new StaffMember(id, state);
  }

  get registeredAt(): Date {
    return this.state.registeredAt;
  }

  get branchId(): string {
    return this.state.branchId;
  }

  get name(): string {
    return this.state.name;
  }

  /** The identity account the member of staff signs in with: the actor of their own commands. */
  get accountId(): string {
    return this.state.accountId;
  }

  /** The customer file that is the member of staff's own, when they are also a customer. */
  get ownCustomerId(): string | undefined {
    return this.state.ownCustomerId;
  }

  get email(): string {
    return this.state.email;
  }

  toState(): StaffMemberState {
    return { ...this.state };
  }
}
