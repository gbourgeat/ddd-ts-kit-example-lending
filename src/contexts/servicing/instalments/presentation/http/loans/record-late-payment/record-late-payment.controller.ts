import { Body, Controller, HttpCode, Inject, Param, Post } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { RecordLatePaymentCommand } from '@/contexts/servicing/instalments/application/commands/record-late-payment/record-late-payment.command';
import { LoansRoutes } from '@/contexts/servicing/presentation/http/loans.routes';
import { ServicingCodes } from '@/contexts/servicing/servicing.codes';
import { RecordLatePaymentParams } from '@/contexts/servicing/instalments/presentation/http/loans/record-late-payment/record-late-payment.params';
import { RecordLatePaymentBody } from '@/contexts/servicing/instalments/presentation/http/loans/record-late-payment/record-late-payment.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: LoansRoutes })
export class RecordLatePaymentController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/instalments/:number/payments')
  @HttpCode(204)
  @KitRoute({
    errors: [ServicingCodes.UnknownLoan],
  })
  async recordLatePayment(
    @Param() params: RecordLatePaymentParams,
    @Body() body: RecordLatePaymentBody,
    @CurrentActor() actor: Actor,
  ): Promise<void> {
    await this.commands.execute(
      new RecordLatePaymentCommand(actor, params.id, { number: Number(params.number), amountCents: body.amountCents }),
    );
  }
}
