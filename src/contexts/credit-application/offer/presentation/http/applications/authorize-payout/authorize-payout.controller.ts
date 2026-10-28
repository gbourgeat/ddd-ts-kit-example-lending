import { Body, Controller, HttpCode, Inject, Param, Post } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { AuthorizePayoutCommand } from '@/contexts/credit-application/offer/application/commands/authorize-payout/authorize-payout.command';
import { ApplicationsRoutes } from '@/contexts/credit-application/presentation/http/applications.routes';
import { AuthorizePayoutParams } from '@/contexts/credit-application/offer/presentation/http/applications/authorize-payout/authorize-payout.params';
import { AuthorizePayoutBody } from '@/contexts/credit-application/offer/presentation/http/applications/authorize-payout/authorize-payout.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ApplicationsRoutes })
export class AuthorizePayoutController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/payout-authorisation')
  @HttpCode(204)
  @KitRoute({
    errors: [
      CreditApplicationCodes.UnknownCreditApplication,
      CreditApplicationCodes.OfferNotSigned,
      CreditApplicationCodes.PayoutTooEarly,
      CreditApplicationCodes.PayoutAfterWithdrawal,
      CreditApplicationCodes.PayoutNotEligible,
    ],
  })
  async authorizePayout(
    @Param() params: AuthorizePayoutParams,
    @Body() body: AuthorizePayoutBody,
    @CurrentActor() actor: Actor,
  ): Promise<void> {
    await this.commands.execute(new AuthorizePayoutCommand(actor, params.id));
  }
}
