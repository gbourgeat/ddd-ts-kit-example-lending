import { Controller, Get, Inject, Query } from '@nestjs/common';
import { pageQuerySchema, pageResponse, pageSchemaOf, type PageBody } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { QueryBus, err, ok, type Actor, type Result } from '@ddd-ts-kit/kernel';
import { customSchema, type Infer, type Schema, type ValidationIssue } from '@ddd-ts-kit/validation';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { MonthlyReportQuery } from '@/contexts/reporting/application/queries/monthly-report/monthly-report.query';
import type { MonthlyReportItem } from '@/contexts/reporting/application/queries/monthly-report/monthly-report.result';
import { ReportsRoutes } from '@/contexts/reporting/presentation/http/reports.routes';
import type { MonthlyReportParams } from '@/contexts/reporting/presentation/http/reports/monthly-report/monthly-report.params';
import { MonthlyReportLine } from '@/contexts/reporting/presentation/http/reports/monthly-report/monthly-report.line';

/** The page of the monthly report: sorted by branch, at most a hundred lines a page. */
const page = pageQuerySchema({ sortable: ['id'] as const, maxSize: 100 });

/** A month, as `YYYY-MM`: the year, then the month from 01 to 12. */
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

const query = monthlyReportQueryParams();
const line = classSchema(MonthlyReportLine);

/** Built by Nest with the bus it injects, served by the kit: a page is no DTO class, so @KitRoute gives its query and its answer. */
@Controller()
@KitRoutes({ group: ReportsRoutes })
export class MonthlyReportController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  /** The report is the context itself: its refusals are the permission of the group's guards, none of its own. */
  @Get('monthly')
  @KitRoute({
    request: { query },
    response: {
      description: 'One page of the monthly report: one line per branch with a figure in the month.',
      body: pageSchemaOf(line),
    },
    errors: [],
  })
  async monthlyReport(
    @Query() params: Infer<typeof query>,
    @CurrentActor() actor: Actor,
  ): Promise<PageBody<Infer<typeof line>>> {
    const answer = await this.queries.execute(new MonthlyReportQuery(actor, params.page, params.month));

    return pageResponse(answer, (item) => toLine(item));
  }
}

/** The query of the monthly report: `month=YYYY-MM` with the page parameters. */
function monthlyReportQueryParams(): Schema<MonthlyReportParams> {
  const parameters = page.toJsonSchema();

  return customSchema((input) => parseParams(input), {
    ...parameters,
    properties: {
      ...(parameters.properties ?? {}),
      month: { type: 'string', pattern: MONTH.source },
    },
    required: ['month'],
  });
}

function parseParams(input: unknown): Result<MonthlyReportParams, ValidationIssue[]> {
  const paged = page.parse(input);
  const month = monthOf(input);

  if (!paged.ok) {
    return err(paged.error);
  }

  if (!month.ok) {
    return err(month.error);
  }

  return ok({ month: month.value, page: paged.value as MonthlyReportParams['page'] });
}

function monthOf(input: unknown): Result<string, ValidationIssue[]> {
  const month = (input as { readonly month?: unknown } | undefined)?.month;

  if (typeof month === 'string' && MONTH.test(month)) {
    return ok(month);
  }

  return err([{ path: 'month', code: 'invalid_month', message: 'The month is expected as YYYY-MM.' }]);
}

/** Only the fields of the public contract leave the context: each branch line as it is declared. */
function toLine(item: MonthlyReportItem): MonthlyReportLine {
  return {
    branchId: item.branchId,
    month: item.month,
    applicationCount: item.applicationCount,
    applicationAmountCents: item.applicationAmountCents,
    decisionCount: item.decisionCount,
    approvalCount: item.approvalCount,
    exceptionCount: item.exceptionCount,
    approvalRateBasisPoints: item.approvalRateBasisPoints,
    exceptionShareBasisPoints: item.exceptionShareBasisPoints,
    portfolioAtRiskBasisPoints: item.portfolioAtRiskBasisPoints,
  };
}
