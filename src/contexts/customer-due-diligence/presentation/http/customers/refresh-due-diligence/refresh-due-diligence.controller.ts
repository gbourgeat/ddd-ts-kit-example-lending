import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { RefreshDueDiligenceCommand } from '@/contexts/customer-due-diligence/application/commands/refresh-due-diligence/refresh-due-diligence.command';
import { CustomersRoutes } from '@/contexts/customer-due-diligence/presentation/http/customers.routes';
import { RefreshDueDiligenceParams } from '@/contexts/customer-due-diligence/presentation/http/customers/refresh-due-diligence/refresh-due-diligence.params';
import { RefreshDueDiligenceBody } from '@/contexts/customer-due-diligence/presentation/http/customers/refresh-due-diligence/refresh-due-diligence.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: CustomersRoutes })
export class RefreshDueDiligenceController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/refresh')
  @KitRoute({
    errors: ['UNKNOWN_CUSTOMER'],
  })
  async refreshDueDiligence(
    @Param() params: RefreshDueDiligenceParams,
    @Body() body: RefreshDueDiligenceBody,
    @CurrentActor() actor: Actor,
  ): Promise<Accepted> {
    const id = await this.commands.execute(
      new RefreshDueDiligenceCommand(actor, params.id, body.name, new Date(body.birthDate)),
    );

    return { id };
  }
}
