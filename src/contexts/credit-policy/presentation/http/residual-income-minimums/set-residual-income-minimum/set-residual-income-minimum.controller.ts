import { Body, Controller, Inject, Put } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { CreditPolicyCodes } from '@/contexts/credit-policy/credit-policy.codes';
import { SetResidualIncomeMinimumCommand } from '@/contexts/credit-policy/application/commands/set-residual-income-minimum/set-residual-income-minimum.command';
import { ResidualIncomeMinimumsRoutes } from '@/contexts/credit-policy/presentation/http/residual-income-minimums.routes';
import { SetResidualIncomeMinimumBody } from '@/contexts/credit-policy/presentation/http/residual-income-minimums/set-residual-income-minimum/set-residual-income-minimum.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ResidualIncomeMinimumsRoutes })
export class SetResidualIncomeMinimumController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Put()
  @KitRoute({
    errors: [CreditPolicyCodes.InvalidResidualIncomeMinimum],
  })
  async setResidualIncomeMinimum(
    @Body() body: SetResidualIncomeMinimumBody,
    @CurrentActor() actor: Actor,
  ): Promise<Accepted> {
    const id = await this.commands.execute(
      new SetResidualIncomeMinimumCommand(actor, body.perAdultInCents, body.perChildInCents),
    );

    return { id };
  }
}
