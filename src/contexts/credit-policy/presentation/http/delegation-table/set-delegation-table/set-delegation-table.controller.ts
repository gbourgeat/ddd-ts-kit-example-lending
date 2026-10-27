import { Body, Controller, Inject, Put } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { CreditPolicyCodes } from '@/contexts/credit-policy/credit-policy.codes';
import { SetDelegationTableCommand } from '@/contexts/credit-policy/application/commands/set-delegation-table/set-delegation-table.command';
import { DelegationTableRoutes } from '@/contexts/credit-policy/presentation/http/delegation-table.routes';
import { SetDelegationTableBody } from '@/contexts/credit-policy/presentation/http/delegation-table/set-delegation-table/set-delegation-table.body';
import { DelegationLevel } from '@/contexts/credit-policy/domain/vocabularies/delegation-level.vocabulary';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: DelegationTableRoutes })
export class SetDelegationTableController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Put()
  @KitRoute({
    errors: [CreditPolicyCodes.InvalidDelegationTable],
  })
  async setDelegationTable(@Body() body: SetDelegationTableBody, @CurrentActor() actor: Actor): Promise<Accepted> {
    const id = await this.commands.execute(
      new SetDelegationTableCommand(actor, {
        effectiveFrom: new Date(body.effectiveFrom),
        limits: [
          { level: DelegationLevel.Advisor, amountCents: body.advisorLimitCents },
          { level: DelegationLevel.CreditAnalyst, amountCents: body.creditAnalystLimitCents },
          { level: DelegationLevel.RiskManager, amountCents: body.riskManagerLimitCents },
          { level: DelegationLevel.CreditCommittee, amountCents: body.creditCommitteeLimitCents },
        ],
      }),
    );

    return { id };
  }
}
