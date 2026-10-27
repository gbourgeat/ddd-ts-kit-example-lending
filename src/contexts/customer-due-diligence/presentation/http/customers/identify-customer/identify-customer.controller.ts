import { Body, Controller, Inject, Post } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { IdentifyCustomerCommand } from '@/contexts/customer-due-diligence/application/commands/identify-customer/identify-customer.command';
import { CustomersRoutes } from '@/contexts/customer-due-diligence/presentation/http/customers.routes';
import { IdentifyCustomerBody } from '@/contexts/customer-due-diligence/presentation/http/customers/identify-customer/identify-customer.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: CustomersRoutes })
export class IdentifyCustomerController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post()
  @KitRoute({
    summary: 'Identify a person with its identity document and its proof of address',
    errors: ['IDENTITY_DOCUMENT_EXPIRED', 'PROOF_OF_ADDRESS_TOO_OLD'],
  })
  async identifyCustomer(@Body() body: IdentifyCustomerBody, @CurrentActor() actor: Actor): Promise<Accepted> {
    const id = await this.commands.execute(
      new IdentifyCustomerCommand(
        actor,
        body.documentKind,
        body.documentNumber,
        body.issuingCountry,
        new Date(body.documentExpiresOn),
        body.address,
        new Date(body.addressProofDatedOn),
        body.name,
        new Date(body.birthDate),
      ),
    );

    return { id };
  }
}
