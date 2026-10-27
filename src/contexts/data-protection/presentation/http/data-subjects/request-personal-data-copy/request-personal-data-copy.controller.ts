import { Controller, HttpCode, Inject, Param, Post } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { RequestPersonalDataCopyCommand } from '@/contexts/data-protection/application/commands/request-personal-data-copy/request-personal-data-copy.command';
import { DataSubjectsRoutes } from '@/contexts/data-protection/presentation/http/data-subjects.routes';
import { PersonalDataCopyLink } from '@/contexts/data-protection/presentation/http/data-subjects/request-personal-data-copy/personal-data-copy-link.answer';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: DataSubjectsRoutes })
export class RequestPersonalDataCopyController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':customerId/copies')
  @HttpCode(200)
  @KitRoute({
    // The command raises no refusal of its own: a caller who is neither the customer nor an operator is refused FORBIDDEN by the route group.
    errors: [],
  })
  async requestPersonalDataCopy(
    @Param('customerId') customerId: string,
    @CurrentActor() actor: Actor,
  ): Promise<PersonalDataCopyLink> {
    const link = await this.commands.execute(new RequestPersonalDataCopyCommand(actor, customerId));

    return { url: link.url, expiresAt: link.expiresAt.toISOString() };
  }
}
