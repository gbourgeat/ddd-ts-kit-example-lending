import { Body, Controller, Inject, Post } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { CreditPolicyCodes } from '@/contexts/credit-policy/credit-policy.codes';
import { DefineProductCommand } from '@/contexts/credit-policy/application/commands/define-product/define-product.command';
import { ProductsRoutes } from '@/contexts/credit-policy/presentation/http/products.routes';
import { DefineProductBody } from '@/contexts/credit-policy/presentation/http/products/define-product/define-product.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ProductsRoutes })
export class DefineProductController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post()
  @KitRoute({
    errors: [
      CreditPolicyCodes.ProductBoundsInverted,
      CreditPolicyCodes.InvalidArrangementFee,
      CreditPolicyCodes.InvalidScoreThreshold,
    ],
  })
  async defineProduct(@Body() body: DefineProductBody, @CurrentActor() actor: Actor): Promise<Accepted> {
    const id = await this.commands.execute(new DefineProductCommand(actor, body));

    return { id };
  }
}
