import { Body, Controller, HttpCode, Inject, Param, Post } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { RequestExceptionCommand } from '@/contexts/credit-application/decision/application/commands/request-exception/request-exception.command';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
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
    errors: [
      CreditApplicationCodes.UnknownCreditApplication,
      CreditApplicationCodes.NotAssessed,
      CreditApplicationCodes.AlreadyDecided,
      CreditApplicationCodes.ExceptionAlreadyRequested,
      CreditApplicationCodes.InvalidExceptionJustification,
      CreditApplicationCodes.ExceptionNotAboveLimit,
      CreditApplicationCodes.PreparerCannotDecide,
      CreditApplicationCodes.ConflictedDecider,
      CreditApplicationCodes.UnknownDeciderLevel,
      CreditApplicationCodes.UnknownDelegationTable,
    ],
  })
  async requestException(
    @Param() params: RequestExceptionParams,
    @Body() body: RequestExceptionBody,
    @CurrentActor() actor: Actor,
  ): Promise<void> {
    await this.commands.execute(new RequestExceptionCommand(actor, params.id, body.justification));
  }
}
