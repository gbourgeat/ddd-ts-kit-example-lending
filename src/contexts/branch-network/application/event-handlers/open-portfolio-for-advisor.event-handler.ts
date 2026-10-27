import { systemActor, type CommandBus } from '@ddd-ts-kit/kernel';
import { UnknownStaffMember } from '@/contexts/branch-network/domain/errors/unknown-staff-member.error';
import type { StaffMemberRepository } from '@/contexts/branch-network/domain/repositories/staff-member.repository';
import type { StaffMemberAppointed } from '@/contexts/branch-network/domain/events/staff-member-appointed.event';
import { OpenPortfolioCommand } from '@/contexts/branch-network/application/commands/open-portfolio/open-portfolio.command';

/**
 * When a staff member is appointed, the advisor gets an empty portfolio on their branch. The appointment carries
 * the identifier only, so the branch is read from the staff member saved in the same transaction.
 */
export class OpenPortfolioForAdvisorEventHandler {
  constructor(
    private readonly staffMemberRepository: StaffMemberRepository,
    private readonly commands: CommandBus,
  ) {}

  async handle(event: StaffMemberAppointed): Promise<void> {
    const staffMember = await this.staffMemberRepository.findById(event.aggregateId);

    if (!staffMember) {
      throw UnknownStaffMember.forStaffMember(event.aggregateId);
    }

    await this.commands.execute(
      new OpenPortfolioCommand(
        systemActor(OpenPortfolioForAdvisorEventHandler.name),
        staffMember.branchId,
        staffMember.id,
      ),
    );
  }
}
