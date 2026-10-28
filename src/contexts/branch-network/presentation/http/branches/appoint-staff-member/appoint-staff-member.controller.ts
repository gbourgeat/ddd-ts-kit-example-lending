import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { BranchNetworkCodes } from '@/contexts/branch-network/branch-network.codes';
import { AppointStaffMemberCommand } from '@/contexts/branch-network/application/commands/appoint-staff-member/appoint-staff-member.command';
import { BranchesRoutes } from '@/contexts/branch-network/presentation/http/branches.routes';
import { AppointStaffMemberParams } from '@/contexts/branch-network/presentation/http/branches/appoint-staff-member/appoint-staff-member.params';
import { AppointStaffMemberBody } from '@/contexts/branch-network/presentation/http/branches/appoint-staff-member/appoint-staff-member.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: BranchesRoutes })
export class AppointStaffMemberController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/staff')
  @KitRoute({
    errors: [BranchNetworkCodes.BranchNotOpened],
  })
  async appointStaffMember(
    @Param() params: AppointStaffMemberParams,
    @Body() body: AppointStaffMemberBody,
    @CurrentActor() actor: Actor,
  ): Promise<Accepted> {
    const id = await this.commands.execute(
      new AppointStaffMemberCommand(
        actor,
        params.id,
        body.name,
        body.email,
        body.accountId,
        body.level,
        body.ownCustomerId,
      ),
    );

    return { id };
  }
}
