import { Body, Controller, HttpCode, Inject, Param, Post } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { ReverseWriteOffCommand } from '@/contexts/servicing/ledger/application/commands/reverse-write-off/reverse-write-off.command';
import { LoansRoutes } from '@/contexts/servicing/presentation/http/loans.routes';
import { ReverseWriteOffParams } from '@/contexts/servicing/ledger/presentation/http/loans/reverse-write-off/reverse-write-off.params';
import { ReverseWriteOffBody } from '@/contexts/servicing/ledger/presentation/http/loans/reverse-write-off/reverse-write-off.body';
import { ServicingCodes } from '@/contexts/servicing/servicing.codes';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: LoansRoutes })
export class ReverseWriteOffController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/write-off-reversal')
  @HttpCode(204)
  @KitRoute({
    errors: [ServicingCodes.UnknownLoan, ServicingCodes.LoanNotWrittenOff],
  })
  async reverseWriteOff(
    @Param() params: ReverseWriteOffParams,
    @Body() body: ReverseWriteOffBody,
    @CurrentActor() actor: Actor,
  ): Promise<void> {
    await this.commands.execute(new ReverseWriteOffCommand(actor, params.id));
  }
}
