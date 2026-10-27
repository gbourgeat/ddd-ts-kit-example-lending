import { Body, Controller, Inject, Post } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { BranchNetworkCodes } from '@/contexts/branch-network/branch-network.codes';
import { DeclareConflictOfInterestCommand } from '@/contexts/branch-network/application/commands/declare-conflict-of-interest/declare-conflict-of-interest.command';
import { ConflictsRoutes } from '@/contexts/branch-network/presentation/http/conflicts.routes';
import { DeclareConflictOfInterestBody } from '@/contexts/branch-network/presentation/http/conflicts/declare-conflict-of-interest/declare-conflict-of-interest.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ConflictsRoutes })
export class DeclareConflictOfInterestController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post()
  @KitRoute({
    errors: [BranchNetworkCodes.UnknownStaffMember, BranchNetworkCodes.ConflictOnOwnRecord],
  })
  async declareConflictOfInterest(
    @Body() body: DeclareConflictOfInterestBody,
    @CurrentActor() actor: Actor,
  ): Promise<Accepted> {
    const id = await this.commands.execute(new DeclareConflictOfInterestCommand(actor, body.customerId));

    return { id };
  }
}
