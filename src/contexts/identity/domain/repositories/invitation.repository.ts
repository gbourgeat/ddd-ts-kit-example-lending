import { Repository } from '@ddd-ts-kit/kernel';
import type { Invitation } from '@/contexts/identity/domain/aggregates/invitation.aggregate';

export abstract class InvitationRepository extends Repository<Invitation> {
  /** The invitation whose token has this digest. */
  abstract findByTokenHash(tokenHash: string): Promise<Invitation | undefined>;
}
