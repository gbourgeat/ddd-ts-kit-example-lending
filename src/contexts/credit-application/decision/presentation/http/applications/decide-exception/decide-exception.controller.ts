import { Body, Controller, HttpCode, Inject, Param, Post } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { DecideExceptionCommand } from '@/contexts/credit-application/decision/application/commands/decide-exception/decide-exception.command';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { ApplicationsRoutes } from '@/contexts/credit-application/presentation/http/applications.routes';
import { DecideExceptionParams } from '@/contexts/credit-application/decision/presentation/http/applications/decide-exception/decide-exception.params';
import { DecideExceptionBody } from '@/contexts/credit-application/decision/presentation/http/applications/decide-exception/decide-exception.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ApplicationsRoutes })
export class DecideExceptionController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/exception-decision')
  @HttpCode(204)
  @KitRoute({
    errors: [
      CreditApplicationCodes.UnknownCreditApplication,
      CreditApplicationCodes.UnknownDeciderLevel,
      CreditApplicationCodes.UnknownDelegationTable,
      CreditApplicationCodes.AlreadyDecided,
      CreditApplicationCodes.NoExceptionRequested,
      CreditApplicationCodes.ExceptionAlreadyDecided,
      CreditApplicationCodes.InvalidDecisionReasons,
      CreditApplicationCodes.PreparerCannotDecide,
      CreditApplicationCodes.ConflictedDecider,
      CreditApplicationCodes.NotCreditCommittee,
    ],
  })
  async decideException(
    @Param() params: DecideExceptionParams,
    @Body() body: DecideExceptionBody,
    @CurrentActor() actor: Actor,
  ): Promise<void> {
    await this.commands.execute(
      new DecideExceptionCommand(actor, params.id, { outcome: body.outcome, reasons: body.reasons }),
    );
  }
}
