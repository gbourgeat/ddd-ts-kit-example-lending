import { Body, Controller, HttpCode, Inject, Param, Post } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { AcceptOfferCommand } from '@/contexts/credit-application/offer/application/commands/accept-offer/accept-offer.command';
import { OffersRoutes } from '@/contexts/credit-application/presentation/http/offers.routes';
import { AcceptOfferParams } from '@/contexts/credit-application/offer/presentation/http/offers/accept-offer/accept-offer.params';
import { AcceptOfferBody } from '@/contexts/credit-application/offer/presentation/http/offers/accept-offer/accept-offer.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: OffersRoutes })
export class AcceptOfferController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/acceptance')
  @HttpCode(204)
  @KitRoute({
    errors: [
      CreditApplicationCodes.UnknownOffer,
      CreditApplicationCodes.OfferNotIssued,
      CreditApplicationCodes.OfferExpired,
      CreditApplicationCodes.OfferAlreadyAccepted,
    ],
  })
  async acceptOffer(
    @Param() params: AcceptOfferParams,
    @Body() body: AcceptOfferBody,
    @CurrentActor() actor: Actor,
  ): Promise<void> {
    await this.commands.execute(new AcceptOfferCommand(actor, params.id));
  }
}
