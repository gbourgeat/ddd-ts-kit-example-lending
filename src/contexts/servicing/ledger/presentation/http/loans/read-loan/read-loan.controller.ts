import { Controller, Get, Inject, Param } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { QueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { ReadLoanQuery } from '@/contexts/servicing/ledger/application/queries/read-loan/read-loan.query';
import { LoansRoutes } from '@/contexts/servicing/presentation/http/loans.routes';
import { ServicingCodes } from '@/contexts/servicing/servicing.codes';
import { ReadLoanParams } from '@/contexts/servicing/ledger/presentation/http/loans/read-loan/read-loan.params';
import { ReadLoanAnswer } from '@/contexts/servicing/ledger/presentation/http/loans/read-loan/read-loan.answer';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: LoansRoutes })
export class ReadLoanController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  @Get(':id')
  @KitRoute({
    errors: [ServicingCodes.UnknownLoan],
  })
  async readLoan(@Param() params: ReadLoanParams, @CurrentActor() actor: Actor): Promise<ReadLoanAnswer> {
    const loan = await this.queries.execute(new ReadLoanQuery(actor, params.id));

    return {
      loanId: loan.loanId,
      status: loan.status,
      principalCents: loan.principalCents,
      annualRateBasisPoints: loan.annualRateBasisPoints,
      durationMonths: loan.durationMonths,
      instalmentsCents: [...loan.instalmentsCents],
      instalmentsDue: [...loan.instalmentsDue],
      instalmentsPaid: [...loan.instalmentsPaid],
      instalmentsUnpaid: [...loan.instalmentsUnpaid],
      arrearsBucket: loan.arrearsBucket,
    };
  }
}
