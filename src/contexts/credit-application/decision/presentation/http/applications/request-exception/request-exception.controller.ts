import { Body, Controller, HttpCode, Inject, Param, Post } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { RequestExceptionCommand } from '@/contexts/credit-application/decision/application/commands/request-exception/request-exception.command';
import { ApplicationsRoutes } from '@/contexts/credit-application/presentation/http/applications.routes';
import { RequestExceptionParams } from '@/contexts/credit-application/decision/presentation/http/applications/request-exception/request-exception.params';
import { RequestExceptionBody } from '@/contexts/credit-application/decision/presentation/http/applications/request-exception/request-exception.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ApplicationsRoutes })
export class RequestExceptionController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/exceptions')
  @HttpCode(204)
  @KitRoute({
    // TODO(domain): list the codes of the refusals "request exception" can raise, as their factories set them, so that they appear in the contract with their status (`errors/known-code`).
    errors: [],
  })
  async requestException(
    @Param() params: RequestExceptionParams,
    @Body() body: RequestExceptionBody,
    @CurrentActor() actor: Actor,
  ): Promise<void> {
    // TODO(domain): build the command from the parameters (body, params); the caller is already there.
    await this.commands.execute(new RequestExceptionCommand(actor));
  }
}
