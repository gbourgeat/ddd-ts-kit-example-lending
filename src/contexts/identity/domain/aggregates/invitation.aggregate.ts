import { AggregateRoot } from '@ddd-ts-kit/kernel';
import { InvitationExpired } from '@/contexts/identity/domain/errors/invitation-expired.error';
import { InvitationNotAddressedToAccount } from '@/contexts/identity/domain/errors/invitation-not-addressed-to-account.error';
import { InvitationNotPending } from '@/contexts/identity/domain/errors/invitation-not-pending.error';
import { InvitationAccepted } from '@/contexts/identity/domain/events/invitation-accepted.event';
import { InvitationDeclined } from '@/contexts/identity/domain/events/invitation-declined.event';
import { InvitationIssued } from '@/contexts/identity/domain/events/invitation-issued.event';
import { InvitationRevoked } from '@/contexts/identity/domain/events/invitation-revoked.event';
import type { EmailAddress } from '@/contexts/identity/domain/value-objects/email-address.vo';
import { InvitationStatus } from '@/contexts/identity/domain/vocabularies/invitation-status.vocabulary';
import type { MemberRole } from '@/contexts/identity/domain/vocabularies/member-role.vocabulary';

/** How long an invitation can be answered: a week, then a new one is sent. */
const VALIDITY_MS = 7 * 86_400_000;

export interface InvitationState {
  readonly organisationId: string;
  readonly email: EmailAddress;
  readonly role: MemberRole;
  /** The digest of the token sent to the person: the token itself is never stored. */
  readonly tokenHash: string;
  readonly invitedBy: string;
  readonly issuedAt: Date;
  readonly expiresAt: Date;
  readonly status: InvitationStatus;
  readonly answeredAt: Date | undefined;
}

/** What an invitation is issued with. */
export type InvitationTerms = Pick<InvitationState, 'organisationId' | 'email' | 'role' | 'tokenHash' | 'invitedBy'> & {
  readonly delegationId?: string;
};

/** The person who answers an invitation: an account, with the email address its provider knows. */
export interface Invitee {
  readonly id: string;
  readonly email: EmailAddress;
}

/** An organisation asks a person, by email address, to join it in a role; the answer is theirs alone. */
export class Invitation extends AggregateRoot<string> {
  private constructor(
    id: string,
    private state: InvitationState,
  ) {
    super(id);
  }

  /** `delegationId` names the delegation that lent the right to invite, when the role of the inviter does not grant it. */
  static issue(id: string, terms: InvitationTerms, now: Date): Invitation {
    const expiresAt = new Date(now.getTime() + VALIDITY_MS);
    const pending = { status: InvitationStatus.Pending, issuedAt: now, expiresAt, answeredAt: undefined };
    const { organisationId, email, role, tokenHash, invitedBy, delegationId } = terms;
    const issued = new Invitation(id, { organisationId, email, role, tokenHash, invitedBy, ...pending });
    const under = delegationId === undefined ? {} : { delegationId };

    issued.record(new InvitationIssued(id, now, { organisationId, email: email.value, role, expiresAt, ...under }));

    return issued;
  }

  static rehydrate(id: string, state: InvitationState): Invitation {
    return new Invitation(id, state);
  }

  /** By the person it was addressed to, before it expires: they become a member (see `AcceptInvitationHandler`). */
  accept(invitee: Invitee, now: Date): void {
    this.assertAnswerableBy(invitee, now);
    this.answer(InvitationStatus.Accepted, now);
    this.record(new InvitationAccepted(this.id, now, { organisationId: this.organisationId, accountId: invitee.id }));
  }

  decline(invitee: Invitee, now: Date): void {
    this.assertAnswerableBy(invitee, now);
    this.answer(InvitationStatus.Declined, now);
    this.record(new InvitationDeclined(this.id, now, { organisationId: this.organisationId }));
  }

  /** Taken back by the organisation while it waits for an answer, expired or not. */
  revoke(now: Date): void {
    if (this.state.status !== InvitationStatus.Pending) {
      throw InvitationNotPending.forInvitation(this.id, this.state.status);
    }

    this.answer(InvitationStatus.Revoked, now);
    this.record(new InvitationRevoked(this.id, now, { organisationId: this.organisationId }));
  }

  get organisationId(): string {
    return this.state.organisationId;
  }

  get email(): EmailAddress {
    return this.state.email;
  }

  get role(): MemberRole {
    return this.state.role;
  }

  get status(): InvitationStatus {
    return this.state.status;
  }

  get expiresAt(): Date {
    return this.state.expiresAt;
  }

  toState(): InvitationState {
    return { ...this.state };
  }

  private assertAnswerableBy(invitee: Invitee, now: Date): void {
    if (this.state.status !== InvitationStatus.Pending) {
      throw InvitationNotPending.forInvitation(this.id, this.state.status);
    }

    if (now.getTime() >= this.state.expiresAt.getTime()) {
      throw InvitationExpired.forInvitation(this.id, this.state.expiresAt);
    }

    if (!invitee.email.equals(this.state.email)) {
      throw InvitationNotAddressedToAccount.forInvitation(this.id);
    }
  }

  private answer(status: InvitationStatus, now: Date): void {
    this.state = { ...this.state, status, answeredAt: now };
  }
}
