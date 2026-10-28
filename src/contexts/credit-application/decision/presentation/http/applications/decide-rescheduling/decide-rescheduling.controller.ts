import { Body, Controller, HttpCode, Inject, Param, Post } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { DecideReschedulingCommand } from '@/contexts/credit-application/decision/application/commands/decide-rescheduling/decide-rescheduling.command';
import { ApplicationsRoutes } from '@/contexts/credit-application/presentation/http/applications.routes';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { DecideReschedulingParams } from '@/contexts/credit-application/decision/presentation/http/applications/decide-rescheduling/decide-rescheduling.params';
import { DecideReschedulingBody } from '@/contexts/credit-application/decision/presentation/http/applications/decide-rescheduling/decide-rescheduling.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ApplicationsRoutes })
export class DecideReschedulingController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/rescheduling-decision')
  @HttpCode(204)
  @KitRoute({
    errors: [
      CreditApplicationCodes.UnknownCreditApplication,
      CreditApplicationCodes.ReschedulingNotApproved,
      CreditApplicationCodes.InvalidDuration,
      CreditApplicationCodes.UnknownDeciderLevel,
      CreditApplicationCodes.UnknownDelegationTable,
      CreditApplicationCodes.DecisionAboveLimit,
      CreditApplicationCodes.PreparerCannotDecide,
      CreditApplicationCodes.ConflictedDecider,
    ],
  })
  async decideRescheduling(
    @Param() params: DecideReschedulingParams,
    @Body() body: DecideReschedulingBody,
    @CurrentActor() actor: Actor,
  ): Promise<void> {
    await this.commands.execute(
      new DecideReschedulingCommand(actor, params.id, body.durationMonths, body.outstandingAmountCents),
    );
  }
}
