import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { NameCoBorrowerCommand } from '@/contexts/credit-application/file/application/commands/name-co-borrower/name-co-borrower.command';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { ApplicationsRoutes } from '@/contexts/credit-application/presentation/http/applications.routes';
import { NameCoBorrowerParams } from '@/contexts/credit-application/file/presentation/http/applications/name-co-borrower/name-co-borrower.params';
import { NameCoBorrowerBody } from '@/contexts/credit-application/file/presentation/http/applications/name-co-borrower/name-co-borrower.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ApplicationsRoutes })
export class NameCoBorrowerController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/co-borrowers')
  @KitRoute({
    errors: [CreditApplicationCodes.UnknownCreditApplication],
  })
  async nameCoBorrower(
    @Param() params: NameCoBorrowerParams,
    @Body() body: NameCoBorrowerBody,
    @CurrentActor() actor: Actor,
  ): Promise<Accepted> {
    const id = await this.commands.execute(new NameCoBorrowerCommand(actor, params.id, body.coBorrowerId));

    return { id };
  }
}
