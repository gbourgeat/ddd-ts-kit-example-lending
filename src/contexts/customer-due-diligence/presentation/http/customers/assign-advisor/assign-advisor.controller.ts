import { Body, Controller, Inject, Param, Put } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { AssignAdvisorCommand } from '@/contexts/customer-due-diligence/application/commands/assign-advisor/assign-advisor.command';
import { CustomersRoutes } from '@/contexts/customer-due-diligence/presentation/http/customers.routes';
import { AssignAdvisorParams } from '@/contexts/customer-due-diligence/presentation/http/customers/assign-advisor/assign-advisor.params';
import { AssignAdvisorBody } from '@/contexts/customer-due-diligence/presentation/http/customers/assign-advisor/assign-advisor.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: CustomersRoutes })
export class AssignAdvisorController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Put(':id/advisor')
  @KitRoute({
    summary: 'Give a customer its advisor',
    errors: ['UNKNOWN_CUSTOMER'],
  })
  async assignAdvisor(
    @Param() params: AssignAdvisorParams,
    @Body() body: AssignAdvisorBody,
    @CurrentActor() actor: Actor,
  ): Promise<Accepted> {
    const id = await this.commands.execute(new AssignAdvisorCommand(actor, params.id, body.advisorId));

    return { id };
  }
}
