import { Controller, Get, Inject, Param } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { QueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { ReadBrokerRegistrationQuery } from '@/contexts/credit-application/file/application/queries/read-broker-registration/read-broker-registration.query';
import { BrokersRoutes } from '@/contexts/credit-application/presentation/http/brokers.routes';
import { ReadBrokerRegistrationParams } from '@/contexts/credit-application/file/presentation/http/brokers/read-broker-registration/read-broker-registration.params';
import { ReadBrokerRegistrationAnswer } from '@/contexts/credit-application/file/presentation/http/brokers/read-broker-registration/read-broker-registration.answer';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: BrokersRoutes })
export class ReadBrokerRegistrationController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  @Get(':brokerId/registration')
  @KitRoute({
    errors: [CreditApplicationCodes.UnknownBrokerRegistration],
  })
  async readBrokerRegistration(
    @Param() params: ReadBrokerRegistrationParams,
    @CurrentActor() actor: Actor,
  ): Promise<ReadBrokerRegistrationAnswer> {
    const registration = await this.queries.execute(new ReadBrokerRegistrationQuery(actor, params.brokerId));

    return {
      brokerId: registration.brokerId,
      inForce: registration.inForce,
      since: registration.since,
      until: registration.until,
    };
  }
}
