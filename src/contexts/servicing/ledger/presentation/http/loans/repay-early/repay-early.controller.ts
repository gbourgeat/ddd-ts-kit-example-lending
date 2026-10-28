import { Body, Controller, HttpCode, Inject, Param, Post } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { RepayEarlyCommand } from '@/contexts/servicing/ledger/application/commands/repay-early/repay-early.command';
import { LoansRoutes } from '@/contexts/servicing/presentation/http/loans.routes';
import { RepayEarlyParams } from '@/contexts/servicing/ledger/presentation/http/loans/repay-early/repay-early.params';
import { RepayEarlyBody } from '@/contexts/servicing/ledger/presentation/http/loans/repay-early/repay-early.body';
import { ServicingCodes } from '@/contexts/servicing/servicing.codes';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: LoansRoutes })
export class RepayEarlyController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/early-repayments')
  @HttpCode(204)
  @KitRoute({
    errors: [
      ServicingCodes.UnknownLoan,
      ServicingCodes.LoanAlreadyClosed,
      ServicingCodes.InvalidRepayment,
      ServicingCodes.EarlyRepaymentTooHigh,
    ],
  })
  async repayEarly(
    @Param() params: RepayEarlyParams,
    @Body() body: RepayEarlyBody,
    @CurrentActor() actor: Actor,
  ): Promise<void> {
    await this.commands.execute(new RepayEarlyCommand(actor, params.id, body.capitalCents));
  }
}
