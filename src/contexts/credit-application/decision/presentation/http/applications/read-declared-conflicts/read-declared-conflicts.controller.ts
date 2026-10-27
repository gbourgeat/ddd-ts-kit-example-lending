import { Controller, Get, Inject, Param } from '@nestjs/common';
import { KitRoute, KitRoutes, CurrentActor } from '@ddd-ts-kit/http/nest';
import { QueryBus, type Actor } from '@ddd-ts-kit/kernel';
import { ReadDeclaredConflictsQuery } from '@/contexts/credit-application/decision/application/queries/read-declared-conflicts/read-declared-conflicts.query';
import { CreditApplicationCodes } from '@/contexts/credit-application/credit-application.codes';
import { ApplicationsRoutes } from '@/contexts/credit-application/presentation/http/applications.routes';
import { ReadDeclaredConflictsParams } from '@/contexts/credit-application/decision/presentation/http/applications/read-declared-conflicts/read-declared-conflicts.params';
import { ReadDeclaredConflictsAnswer } from '@/contexts/credit-application/decision/presentation/http/applications/read-declared-conflicts/read-declared-conflicts.answer';

/** Built by Nest with the bus it injects, served by the kit: what each method takes and answers is read from its signature. */
@Controller()
@KitRoutes({ group: ApplicationsRoutes })
export class ReadDeclaredConflictsController {
  constructor(@Inject(QueryBus) private readonly queries: QueryBus) {}

  @Get(':id/declared-conflicts')
  @KitRoute({
    errors: [CreditApplicationCodes.UnknownCreditApplication],
  })
  async readDeclaredConflicts(
    @Param() params: ReadDeclaredConflictsParams,
    @CurrentActor() actor: Actor,
  ): Promise<ReadDeclaredConflictsAnswer> {
    const answer = await this.queries.execute(new ReadDeclaredConflictsQuery(actor, params.id));

    return {
      conflicts: answer.conflicts.map((conflict) => ({
        conflictOfInterestId: conflict.conflictOfInterestId,
        staffMemberId: conflict.staffMemberId,
        customerId: conflict.customerId,
      })),
    };
  }
}
