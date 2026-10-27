import { Body, Controller, Inject, Post } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { OpenBranchCommand } from '@/contexts/branch-network/application/commands/open-branch/open-branch.command';
import { BranchesRoutes } from '@/contexts/branch-network/presentation/http/branches.routes';
import { OpenBranchBody } from '@/contexts/branch-network/presentation/http/branches/open-branch/open-branch.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: BranchesRoutes })
export class OpenBranchController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post()
  @KitRoute({
    errors: [],
  })
  async openBranch(@Body() body: OpenBranchBody, @CurrentActor() actor: Actor): Promise<Accepted> {
    const id = await this.commands.execute(new OpenBranchCommand(actor));

    return { id };
  }
}
