import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { FinancialCrimeCodes } from '@/contexts/financial-crime/financial-crime.codes';
import { CloseAlertCommand } from '@/contexts/financial-crime/application/commands/close-alert/close-alert.command';
import { AlertsRoutes } from '@/contexts/financial-crime/presentation/http/alerts.routes';
import { CloseAlertParams } from '@/contexts/financial-crime/presentation/http/alerts/close-alert/close-alert.params';
import { CloseAlertBody } from '@/contexts/financial-crime/presentation/http/alerts/close-alert/close-alert.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: AlertsRoutes })
export class CloseAlertController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/closure')
  @KitRoute({
    errors: [
      FinancialCrimeCodes.AlertAlreadyClosed,
      FinancialCrimeCodes.UnknownAlert,
      FinancialCrimeCodes.ClosureReasonMissing,
    ],
  })
  async closeAlert(
    @Param() params: CloseAlertParams,
    @Body() body: CloseAlertBody,
    @CurrentActor() actor: Actor,
  ): Promise<Accepted> {
    const id = await this.commands.execute(new CloseAlertCommand(actor, params.id, body.reason));

    return { id };
  }
}
