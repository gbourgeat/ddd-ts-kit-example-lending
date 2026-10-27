import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { NameGuarantorCommand } from '@/contexts/credit-application/file/application/commands/name-guarantor/name-guarantor.command';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { ApplicationsRoutes } from '@/contexts/credit-application/presentation/http/applications.routes';
import { NameGuarantorParams } from '@/contexts/credit-application/file/presentation/http/applications/name-guarantor/name-guarantor.params';
import { NameGuarantorBody } from '@/contexts/credit-application/file/presentation/http/applications/name-guarantor/name-guarantor.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ApplicationsRoutes })
export class NameGuarantorController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/guarantors')
  @KitRoute({
    errors: [CreditApplicationCodes.UnknownCreditApplication],
  })
  async nameGuarantor(
    @Param() params: NameGuarantorParams,
    @Body() body: NameGuarantorBody,
    @CurrentActor() actor: Actor,
  ): Promise<Accepted> {
    const id = await this.commands.execute(new NameGuarantorCommand(actor, params.id, body.guarantorId));

    return { id };
  }
}
