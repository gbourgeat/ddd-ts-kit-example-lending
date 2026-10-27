import { Body, Controller, Inject, Post } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { BrokerageCodes } from '@/contexts/brokerage/brokerage.codes';
import { RegisterBrokerCommand } from '@/contexts/brokerage/application/commands/register-broker/register-broker.command';
import { BrokersRoutes } from '@/contexts/brokerage/presentation/http/brokers.routes';
import { RegisterBrokerBody } from '@/contexts/brokerage/presentation/http/brokers/register-broker/register-broker.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: BrokersRoutes })
export class RegisterBrokerController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post()
  @KitRoute({
    errors: [BrokerageCodes.InvalidBrokerRegistration],
  })
  async registerBroker(@Body() body: RegisterBrokerBody, @CurrentActor() actor: Actor): Promise<Accepted> {
    const id = await this.commands.execute(new RegisterBrokerCommand(actor, body.registrationNumber));

    return { id };
  }
}
