import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { RequestPersonalDataCopyCommand } from '@/contexts/data-protection/application/commands/request-personal-data-copy/request-personal-data-copy.command';
import { DataSubjectsRoutes } from '@/contexts/data-protection/presentation/http/data-subjects.routes';
import { RequestPersonalDataCopyBody } from '@/contexts/data-protection/presentation/http/data-subjects/request-personal-data-copy/request-personal-data-copy.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: DataSubjectsRoutes })
export class RequestPersonalDataCopyController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post('me/copies')
  @HttpCode(204)
  @KitRoute({
    // TODO(domain): list the codes of the refusals "request personal data copy" can raise, as their factories set them, so that they appear in the contract with their status (`errors/known-code`).
    errors: [],
  })
  async requestPersonalDataCopy(
    @Body() body: RequestPersonalDataCopyBody,
    @CurrentActor() actor: Actor,
  ): Promise<void> {
    // TODO(domain): build the command from the parameters (body, params); the caller is already there.
    await this.commands.execute(new RequestPersonalDataCopyCommand(actor));
  }
}
