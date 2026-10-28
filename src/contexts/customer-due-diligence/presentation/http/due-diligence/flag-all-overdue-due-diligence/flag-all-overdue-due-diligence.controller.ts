import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { FlagAllOverdueDueDiligenceCommand } from '@/contexts/customer-due-diligence/application/commands/flag-all-overdue-due-diligence/flag-all-overdue-due-diligence.command';
import { DueDiligenceRoutes } from '@/contexts/customer-due-diligence/presentation/http/due-diligence.routes';
import { FlagAllOverdueDueDiligenceBody } from '@/contexts/customer-due-diligence/presentation/http/due-diligence/flag-all-overdue-due-diligence/flag-all-overdue-due-diligence.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: DueDiligenceRoutes })
export class FlagAllOverdueDueDiligenceController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post('flag-overdue')
  @HttpCode(204)
  @KitRoute({
    summary: 'Flag overdue every due diligence that falls due before the instant, for all customers',
    errors: [],
  })
  async flagAllOverdueDueDiligence(
    @Body() body: FlagAllOverdueDueDiligenceBody,
    @CurrentActor() actor: Actor,
  ): Promise<void> {
    await this.commands.execute(new FlagAllOverdueDueDiligenceCommand(actor, new Date(body.dueBefore)));
  }
}
