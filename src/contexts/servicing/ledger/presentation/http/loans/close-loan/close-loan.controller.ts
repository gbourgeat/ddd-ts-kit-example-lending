import { Body, Controller, HttpCode, Inject, Param, Post } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { CloseLoanCommand } from '@/contexts/servicing/ledger/application/commands/close-loan/close-loan.command';
import { LoansRoutes } from '@/contexts/servicing/presentation/http/loans.routes';
import { CloseLoanParams } from '@/contexts/servicing/ledger/presentation/http/loans/close-loan/close-loan.params';
import { CloseLoanBody } from '@/contexts/servicing/ledger/presentation/http/loans/close-loan/close-loan.body';
import { ServicingCodes } from '@/contexts/servicing/servicing.codes';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: LoansRoutes })
export class CloseLoanController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/closure')
  @HttpCode(204)
  @KitRoute({
    errors: [ServicingCodes.UnknownLoan, ServicingCodes.LoanAlreadyClosed],
  })
  async closeLoan(
    @Param() params: CloseLoanParams,
    @Body() body: CloseLoanBody,
    @CurrentActor() actor: Actor,
  ): Promise<void> {
    await this.commands.execute(new CloseLoanCommand(actor, params.id));
  }
}
