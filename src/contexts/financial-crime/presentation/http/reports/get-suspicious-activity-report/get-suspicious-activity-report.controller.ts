import { Controller, Get, Inject, Param } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { QueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { FinancialCrimeCodes } from '@/contexts/financial-crime/financial-crime.codes';
import { GetSuspiciousActivityReportQuery } from '@/contexts/financial-crime/application/queries/get-suspicious-activity-report/get-suspicious-activity-report.query';
import { ReportsRoutes } from '@/contexts/financial-crime/presentation/http/reports.routes';
import { GetSuspiciousActivityReportParams } from '@/contexts/financial-crime/presentation/http/reports/get-suspicious-activity-report/get-suspicious-activity-report.params';
import { GetSuspiciousActivityReportAnswer } from '@/contexts/financial-crime/presentation/http/reports/get-suspicious-activity-report/get-suspicious-activity-report.answer';

/** Built by Nest with the bus it injects, served by the kit. A report the caller may not see is refused by its permission, before it is looked up. */
@Controller()
@KitRoutes({ group: ReportsRoutes })
export class GetSuspiciousActivityReportController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  @Get(':id')
  @KitRoute({
    errors: [FinancialCrimeCodes.UnknownSuspiciousActivityReport],
  })
  async getSuspiciousActivityReport(
    @Param() params: GetSuspiciousActivityReportParams,
    @CurrentActor() actor: Actor,
  ): Promise<GetSuspiciousActivityReportAnswer> {
    const report = await this.queries.execute(new GetSuspiciousActivityReportQuery(actor, params.id));

    return { id: report.id };
  }
}
