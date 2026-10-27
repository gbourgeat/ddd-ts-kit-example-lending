import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import { type Accepted } from '@ddd-ts-kit/http';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { CommandBus, type Actor } from '@ddd-ts-kit/kernel';
import { DeclareDirectorsAndOwnersCommand } from '@/contexts/customer-due-diligence/application/commands/declare-directors-and-owners/declare-directors-and-owners.command';
import type { PersonIdentity } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';
import { CustomersRoutes } from '@/contexts/customer-due-diligence/presentation/http/customers.routes';
import { DeclareDirectorsAndOwnersParams } from '@/contexts/customer-due-diligence/presentation/http/customers/declare-directors-and-owners/declare-directors-and-owners.params';
import { DeclareDirectorsAndOwnersBody } from '@/contexts/customer-due-diligence/presentation/http/customers/declare-directors-and-owners/declare-directors-and-owners.body';
import type { IdentifyCustomerBody } from '@/contexts/customer-due-diligence/presentation/http/customers/identify-customer/identify-customer.body';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: CustomersRoutes })
export class DeclareDirectorsAndOwnersController {
  constructor(@Inject(CommandBus) private readonly commands: CommandBus) {}

  @Post(':id/directors-and-owners')
  @KitRoute({
    summary: 'Identify each director and beneficial owner of a registered business as a person',
    errors: ['BUSINESS_NOT_REGISTERED', 'UNKNOWN_CUSTOMER', 'IDENTITY_DOCUMENT_EXPIRED', 'PROOF_OF_ADDRESS_TOO_OLD'],
  })
  async declareDirectorsAndOwners(
    @Param() params: DeclareDirectorsAndOwnersParams,
    @Body() body: DeclareDirectorsAndOwnersBody,
    @CurrentActor() actor: Actor,
  ): Promise<Accepted> {
    const id = await this.commands.execute(
      new DeclareDirectorsAndOwnersCommand(
        actor,
        params.id,
        body.directors.map((person) => toPersonIdentity(person)),
        body.beneficialOwners.map((person) => toPersonIdentity(person)),
      ),
    );

    return { id };
  }
}

function toPersonIdentity(person: IdentifyCustomerBody): PersonIdentity {
  return {
    documentKind: person.documentKind,
    documentNumber: person.documentNumber,
    issuingCountry: person.issuingCountry,
    documentExpiresOn: new Date(person.documentExpiresOn),
    address: person.address,
    addressProofDatedOn: new Date(person.addressProofDatedOn),
  };
}
