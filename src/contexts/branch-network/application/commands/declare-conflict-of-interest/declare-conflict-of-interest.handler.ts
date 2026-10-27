import type { Clock, CommandHandler, IdGenerator } from '@ddd-ts-kit/kernel';
import { ConflictOfInterest } from '@/contexts/branch-network/domain/aggregates/conflict-of-interest.aggregate';
import { ConflictOnOwnRecord } from '@/contexts/branch-network/domain/errors/conflict-on-own-record.error';
import { UnknownStaffMember } from '@/contexts/branch-network/domain/errors/unknown-staff-member.error';
import type { ConflictOfInterestRepository } from '@/contexts/branch-network/domain/repositories/conflict-of-interest.repository';
import type { StaffMemberRepository } from '@/contexts/branch-network/domain/repositories/staff-member.repository';
import type { DeclareConflictOfInterestCommand } from '@/contexts/branch-network/application/commands/declare-conflict-of-interest/declare-conflict-of-interest.command';

export class DeclareConflictOfInterestHandler implements CommandHandler<DeclareConflictOfInterestCommand> {
  constructor(
    private readonly conflictOfInterestRepository: ConflictOfInterestRepository,
    private readonly staffMemberRepository: StaffMemberRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(command: DeclareConflictOfInterestCommand): Promise<string> {
    const declarer = await this.staffMemberRepository.findByAccountId(command.actor.id);

    if (!declarer) {
      throw UnknownStaffMember.forStaffMember(command.actor.id);
    }

    if (declarer.ownCustomerId === command.customerId) {
      throw ConflictOnOwnRecord.forCustomer(command.customerId);
    }

    const conflictOfInterest = ConflictOfInterest.create(
      this.ids.next(),
      declarer.id,
      command.customerId,
      this.clock.now(),
    );

    await this.conflictOfInterestRepository.save(conflictOfInterest);

    return conflictOfInterest.id;
  }
}
