import { Controller, Inject, Param, Post } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { FileSuspiciousActivityReportCommand } from '@/contexts/financial-crime/application/commands/file-suspicious-activity-report/file-suspicious-activity-report.command';
import { AlertsRoutes } from '@/contexts/financial-crime/presentation/http/alerts.routes';
import { FileSuspiciousActivityReportParams } from '@/contexts/financial-crime/presentation/http/alerts/file-suspicious-activity-report/file-suspicious-activity-report.params';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: AlertsRoutes })
export class FileSuspiciousActivityReportController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/reports')
  @KitRoute({
    errors: [],
  })
  async fileSuspiciousActivityReport(
    @Param() params: FileSuspiciousActivityReportParams,
    @CurrentActor() actor: Actor,
  ): Promise<Accepted> {
    const id = await this.commands.execute(new FileSuspiciousActivityReportCommand(actor, params.id));

    return { id };
  }
}
