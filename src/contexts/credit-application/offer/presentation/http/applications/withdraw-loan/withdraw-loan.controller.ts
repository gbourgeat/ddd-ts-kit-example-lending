import { Body, Controller, HttpCode, Inject, Param, Post } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { WithdrawLoanCommand } from '@/contexts/credit-application/offer/application/commands/withdraw-loan/withdraw-loan.command';
import { ApplicationsRoutes } from '@/contexts/credit-application/presentation/http/applications.routes';
import { WithdrawLoanParams } from '@/contexts/credit-application/offer/presentation/http/applications/withdraw-loan/withdraw-loan.params';
import { WithdrawLoanBody } from '@/contexts/credit-application/offer/presentation/http/applications/withdraw-loan/withdraw-loan.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ApplicationsRoutes })
export class WithdrawLoanController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/withdrawal')
  @HttpCode(204)
  @KitRoute({
    errors: [
      CreditApplicationCodes.UnknownCreditApplication,
      CreditApplicationCodes.OfferNotSigned,
      CreditApplicationCodes.WithdrawalExpired,
      CreditApplicationCodes.WithdrawalAlreadyRecorded,
    ],
  })
  async withdrawLoan(
    @Param() params: WithdrawLoanParams,
    @Body() body: WithdrawLoanBody,
    @CurrentActor() actor: Actor,
  ): Promise<void> {
    await this.commands.execute(new WithdrawLoanCommand(actor, params.id));
  }
}
