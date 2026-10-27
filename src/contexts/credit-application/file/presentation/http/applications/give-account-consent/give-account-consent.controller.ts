import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { GiveAccountConsentCommand } from '@/contexts/credit-application/file/application/commands/give-account-consent/give-account-consent.command';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { ApplicationsRoutes } from '@/contexts/credit-application/presentation/http/applications.routes';
import { GiveAccountConsentParams } from '@/contexts/credit-application/file/presentation/http/applications/give-account-consent/give-account-consent.params';
import { GiveAccountConsentBody } from '@/contexts/credit-application/file/presentation/http/applications/give-account-consent/give-account-consent.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ApplicationsRoutes })
export class GiveAccountConsentController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/consent')
  @KitRoute({
    errors: [CreditApplicationCodes.UnknownCreditApplication],
  })
  async giveAccountConsent(
    @Param() params: GiveAccountConsentParams,
    @Body() _body: GiveAccountConsentBody,
    @CurrentActor() actor: Actor,
  ): Promise<Accepted> {
    const id = await this.commands.execute(new GiveAccountConsentCommand(actor, params.id));

    return { id };
  }
}
