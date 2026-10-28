import type { Clock, CommandHandler, IdGenerator } from '@ddd-ts-kit/kernel';
import { StaffMember } from '@/contexts/branch-network/domain/aggregates/staff-member.aggregate';
import { BranchNotOpened } from '@/contexts/branch-network/domain/errors/branch-not-opened.error';
import type { BranchRepository } from '@/contexts/branch-network/domain/repositories/branch.repository';
import type { StaffMemberRepository } from '@/contexts/branch-network/domain/repositories/staff-member.repository';
import type { AppointStaffMemberCommand } from '@/contexts/branch-network/application/commands/appoint-staff-member/appoint-staff-member.command';

export class AppointStaffMemberHandler implements CommandHandler<AppointStaffMemberCommand> {
  constructor(
    private readonly branchRepository: BranchRepository,
    private readonly staffMemberRepository: StaffMemberRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock,
  ) {}

  async execute(command: AppointStaffMemberCommand): Promise<string> {
    const branch = await this.branchRepository.findById(command.branchId);

    if (!branch) {
      throw BranchNotOpened.forBranch(command.branchId);
    }

    const staffMember = StaffMember.create(
      this.ids.next(),
      {
        branchId: branch.id,
        name: command.name,
        email: command.email,
        accountId: command.accountId,
        level: command.level,
        ownCustomerId: command.ownCustomerId,
      },
      this.clock.now(),
    );

    await this.staffMemberRepository.save(staffMember);

    return staffMember.id;
  }
}
