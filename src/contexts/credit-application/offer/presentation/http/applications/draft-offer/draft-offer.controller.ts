import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { DraftOfferCommand } from '@/contexts/credit-application/offer/application/commands/draft-offer/draft-offer.command';
import { ApplicationsRoutes } from '@/contexts/credit-application/presentation/http/applications.routes';
import { DraftOfferParams } from '@/contexts/credit-application/offer/presentation/http/applications/draft-offer/draft-offer.params';
import { DraftOfferBody } from '@/contexts/credit-application/offer/presentation/http/applications/draft-offer/draft-offer.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ApplicationsRoutes })
export class DraftOfferController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/offer-draft')
  @KitRoute({
    errors: [
      CreditApplicationCodes.UnknownCreditApplication,
      CreditApplicationCodes.ApplicationNotApproved,
      CreditApplicationCodes.NoRateForOffer,
      CreditApplicationCodes.UnknownLegalMaximumRate,
      CreditApplicationCodes.OfferAboveLegalMaximum,
    ],
  })
  async draftOffer(
    @Param() params: DraftOfferParams,
    @Body() body: DraftOfferBody,
    @CurrentActor() actor: Actor,
  ): Promise<Accepted> {
    const id = await this.commands.execute(new DraftOfferCommand(actor, params.id));

    return { id };
  }
}
