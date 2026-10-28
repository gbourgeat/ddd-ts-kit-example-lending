import { Body, Controller, HttpCode, Inject, Param, Post } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { ContestDecisionCommand } from '@/contexts/credit-application/decision/application/commands/contest-decision/contest-decision.command';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { ApplicationsRoutes } from '@/contexts/credit-application/presentation/http/applications.routes';
import { ContestDecisionParams } from '@/contexts/credit-application/decision/presentation/http/applications/contest-decision/contest-decision.params';
import { ContestDecisionBody } from '@/contexts/credit-application/decision/presentation/http/applications/contest-decision/contest-decision.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ApplicationsRoutes })
export class ContestDecisionController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/contestation')
  @HttpCode(204)
  @KitRoute({
    errors: [
      CreditApplicationCodes.UnknownCreditApplication,
      CreditApplicationCodes.ContestNotDecided,
      CreditApplicationCodes.ContestAlreadyRecorded,
    ],
  })
  async contestDecision(
    @Param() params: ContestDecisionParams,
    @Body() body: ContestDecisionBody,
    @CurrentActor() actor: Actor,
  ): Promise<void> {
    await this.commands.execute(new ContestDecisionCommand(actor, params.id, body.reason));
  }
}
