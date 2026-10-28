import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { ReadAccountInformationCommand } from '@/contexts/credit-application/assessment/application/commands/read-account-information/read-account-information.command';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { ApplicationsRoutes } from '@/contexts/credit-application/presentation/http/applications.routes';
import { ReadAccountInformationParams } from '@/contexts/credit-application/assessment/presentation/http/applications/read-account-information/read-account-information.params';
import { ReadAccountInformationBody } from '@/contexts/credit-application/assessment/presentation/http/applications/read-account-information/read-account-information.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ApplicationsRoutes })
export class ReadAccountInformationController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/account-information')
  @KitRoute({
    errors: [CreditApplicationCodes.MissingAccountConsent, CreditApplicationCodes.UnknownCreditApplication],
  })
  async readAccountInformation(
    @Param() params: ReadAccountInformationParams,
    @Body() _body: ReadAccountInformationBody,
    @CurrentActor() actor: Actor,
  ): Promise<Accepted> {
    const id = await this.commands.execute(new ReadAccountInformationCommand(actor, params.id));

    return { id };
  }
}
