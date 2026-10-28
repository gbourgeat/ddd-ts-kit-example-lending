import { Body, Controller, HttpCode, Inject, Param, Post } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { WriteOffLoanCommand } from '@/contexts/servicing/ledger/application/commands/write-off-loan/write-off-loan.command';
import { LoansRoutes } from '@/contexts/servicing/presentation/http/loans.routes';
import { WriteOffLoanParams } from '@/contexts/servicing/ledger/presentation/http/loans/write-off-loan/write-off-loan.params';
import { WriteOffLoanBody } from '@/contexts/servicing/ledger/presentation/http/loans/write-off-loan/write-off-loan.body';
import { ServicingCodes } from '@/contexts/servicing/servicing.codes';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: LoansRoutes })
export class WriteOffLoanController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/write-off')
  @HttpCode(204)
  @KitRoute({
    errors: [ServicingCodes.UnknownLoan, ServicingCodes.LoanAlreadyClosed],
  })
  async writeOffLoan(
    @Param() params: WriteOffLoanParams,
    @Body() body: WriteOffLoanBody,
    @CurrentActor() actor: Actor,
  ): Promise<void> {
    await this.commands.execute(new WriteOffLoanCommand(actor, params.id));
  }
}
