import { Body, Controller, Inject, Post } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { PublishRateGridCommand } from '@/contexts/credit-policy/application/commands/publish-rate-grid/publish-rate-grid.command';
import { RateGridsRoutes } from '@/contexts/credit-policy/presentation/http/rate-grids.routes';
import { PublishRateGridBody } from '@/contexts/credit-policy/presentation/http/rate-grids/publish-rate-grid/publish-rate-grid.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: RateGridsRoutes })
export class PublishRateGridController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post()
  @KitRoute({
    errors: [],
  })
  async publishRateGrid(@Body() body: PublishRateGridBody, @CurrentActor() actor: Actor): Promise<Accepted> {
    const command = new PublishRateGridCommand(actor, body.productId, new Date(body.effectiveFrom), body.rates);

    const id = await this.commands.execute(command);

    return { id };
  }
}
