import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { DecideApplicationCommand } from '@/contexts/credit-application/decision/application/commands/decide-application/decide-application.command';
import { ApplicationsRoutes } from '@/contexts/credit-application/presentation/http/applications.routes';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { DecideApplicationParams } from '@/contexts/credit-application/decision/presentation/http/applications/decide-application/decide-application.params';
import { DecideApplicationBody } from '@/contexts/credit-application/decision/presentation/http/applications/decide-application/decide-application.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ApplicationsRoutes })
export class DecideApplicationController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/decision')
  @KitRoute({
    errors: [
      CreditApplicationCodes.UnknownCreditApplication,
      CreditApplicationCodes.NotAssessed,
      CreditApplicationCodes.AlreadyDecided,
      CreditApplicationCodes.RefusalNotReviewed,
      CreditApplicationCodes.RefusalProposalStands,
      CreditApplicationCodes.InvalidDecisionReasons,
      CreditApplicationCodes.InvalidDecisionConditions,
      CreditApplicationCodes.UnknownDeciderLevel,
      CreditApplicationCodes.UnknownDelegationTable,
      CreditApplicationCodes.DecisionAboveLimit,
      CreditApplicationCodes.PreparerCannotDecide,
    ],
  })
  async decideApplication(
    @Param() params: DecideApplicationParams,
    @Body() body: DecideApplicationBody,
    @CurrentActor() actor: Actor,
  ): Promise<Accepted> {
    const id = await this.commands.execute(new DecideApplicationCommand(actor, params.id, body));

    return { id };
  }
}
