import { Body, Controller, Inject, Post } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { RegisterBusinessCommand } from '@/contexts/customer-due-diligence/application/commands/register-business/register-business.command';
import { BusinessesRoutes } from '@/contexts/customer-due-diligence/presentation/http/businesses.routes';
import { RegisterBusinessBody } from '@/contexts/customer-due-diligence/presentation/http/businesses/register-business/register-business.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: BusinessesRoutes })
export class RegisterBusinessController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post()
  @KitRoute({
    summary: 'Register the business of a customer',
    response: { description: 'The business is registered; the body carries the identifier of the customer.' },
    errors: ['UNKNOWN_CUSTOMER', 'BUSINESS_ALREADY_REGISTERED'],
  })
  async registerBusiness(@Body() body: RegisterBusinessBody, @CurrentActor() actor: Actor): Promise<Accepted> {
    const id = await this.commands.execute(
      new RegisterBusinessCommand(
        actor,
        body.customerId,
        body.legalName,
        body.registrationNumber,
        body.countryOfRegistration,
        new Date(body.registeredOn),
      ),
    );

    return { id };
  }
}
