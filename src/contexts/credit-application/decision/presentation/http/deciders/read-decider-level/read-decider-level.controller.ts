import { Controller, Get, Inject, Param } from '@nestjs/common';
import { CurrentActor, KitRoute, KitRoutes } from '@ddd-ts-kit/http/nest';
import { QueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { ReadDeciderLevelQuery } from '@/contexts/credit-application/decision/application/queries/read-decider-level/read-decider-level.query';
import { DecidersRoutes } from '@/contexts/credit-application/presentation/http/deciders.routes';
import { ReadDeciderLevelParams } from '@/contexts/credit-application/decision/presentation/http/deciders/read-decider-level/read-decider-level.params';
import { ReadDeciderLevelAnswer } from '@/contexts/credit-application/decision/presentation/http/deciders/read-decider-level/read-decider-level.answer';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: DecidersRoutes })
export class ReadDeciderLevelController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  @Get(':staffMemberId/level')
  @KitRoute({
    errors: [CreditApplicationCodes.UnknownDeciderLevel],
  })
  async readDeciderLevel(
    @Param() params: ReadDeciderLevelParams,
    @CurrentActor() actor: Actor,
  ): Promise<ReadDeciderLevelAnswer> {
    const deciderLevel = await this.queries.execute(new ReadDeciderLevelQuery(actor, params.staffMemberId));

    return {
      staffMemberId: deciderLevel.staffMemberId,
      branchId: deciderLevel.branchId,
      level: deciderLevel.level,
    };
  }
}
