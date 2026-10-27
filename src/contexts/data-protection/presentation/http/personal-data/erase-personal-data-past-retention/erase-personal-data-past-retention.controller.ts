import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { ErasePersonalDataPastRetentionCommand } from '@/contexts/data-protection/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';
import { PersonalDataRoutes } from '@/contexts/data-protection/presentation/http/personal-data.routes';
import { ErasePersonalDataPastRetentionBody } from '@/contexts/data-protection/presentation/http/personal-data/erase-personal-data-past-retention/erase-personal-data-past-retention.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: PersonalDataRoutes })
export class ErasePersonalDataPastRetentionController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post('erasures')
  @HttpCode(204)
  @KitRoute({
    // The command raises no refusal of its own: a caller without data.erase is refused FORBIDDEN by the route group.
    errors: [],
  })
  async erasePersonalDataPastRetention(
    @Body() body: ErasePersonalDataPastRetentionBody,
    @CurrentActor() actor: Actor,
  ): Promise<void> {
    await this.commands.execute(new ErasePersonalDataPastRetentionCommand(actor, new Date(body.asOf)));
  }
}
