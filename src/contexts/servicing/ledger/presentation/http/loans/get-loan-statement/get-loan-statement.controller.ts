import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { QueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { GetLoanStatementQuery } from '@/contexts/servicing/ledger/application/queries/get-loan-statement/get-loan-statement.query';
import type { GetLoanStatementResult } from '@/contexts/servicing/ledger/application/queries/get-loan-statement/get-loan-statement.result';
import { LoansRoutes } from '@/contexts/servicing/presentation/http/loans.routes';
import { ServicingCodes } from '@/contexts/servicing/servicing.codes';
import { GetLoanStatementParams } from '@/contexts/servicing/ledger/presentation/http/loans/get-loan-statement/get-loan-statement.params';
import { GetLoanStatementQueryParams } from '@/contexts/servicing/ledger/presentation/http/loans/get-loan-statement/get-loan-statement-query.params';
import { GetLoanStatementAnswer } from '@/contexts/servicing/ledger/presentation/http/loans/get-loan-statement/get-loan-statement.answer';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: LoansRoutes })
export class GetLoanStatementController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  @Get(':id/statement')
  @KitRoute({
    errors: [ServicingCodes.UnknownLoan],
  })
  async getLoanStatement(
    @Param() params: GetLoanStatementParams,
    @Query() query: GetLoanStatementQueryParams,
    @CurrentActor() actor: Actor,
  ): Promise<GetLoanStatementAnswer> {
    const statement = await this.queries.execute(new GetLoanStatementQuery(actor, params.id, new Date(query.asOf)));

    return toAnswer(statement);
  }
}

function toAnswer(statement: GetLoanStatementResult): GetLoanStatementAnswer {
  return {
    loanId: statement.loanId,
    asOf: statement.asOf,
    outstandingCapitalCents: statement.outstandingCapitalCents,
    arrearsCents: statement.arrearsCents,
    daysPastDue: statement.daysPastDue,
    instalmentsCents: [...statement.instalmentsCents],
    instalmentsDue: [...statement.instalmentsDue],
    instalmentsPaid: [...statement.instalmentsPaid],
    instalmentsUnpaid: [...statement.instalmentsUnpaid],
  };
}
