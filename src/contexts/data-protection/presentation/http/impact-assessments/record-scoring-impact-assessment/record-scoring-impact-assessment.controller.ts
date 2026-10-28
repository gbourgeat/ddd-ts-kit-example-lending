import { acceptedSchema, Controller, type Accepted, type HttpRequest } from '@ddd-ts-kit/http';
import type { CommandBus } from '@ddd-ts-kit/kernel';
import { classSchema } from '@ddd-ts-kit/validation/class-validator';
import { DataProtectionCodes } from '@/contexts/data-protection/data-protection.codes';
import { RecordScoringImpactAssessmentCommand } from '@/contexts/data-protection/application/commands/record-scoring-impact-assessment/record-scoring-impact-assessment.command';
import { ImpactAssessmentsRoutes } from '@/contexts/data-protection/presentation/http/impact-assessments.routes';
import { RecordScoringImpactAssessmentBody } from '@/contexts/data-protection/presentation/http/impact-assessments/record-scoring-impact-assessment/record-scoring-impact-assessment.body';

const body = classSchema(RecordScoringImpactAssessmentBody);

@Controller({
  group: ImpactAssessmentsRoutes,
  method: 'POST',
  path: '/',
  summary: 'Record scoring impact assessment',
  body,
  response: { status: 201, description: 'Done; the body carries the identifier.', body: acceptedSchema },
  errors: [
    DataProtectionCodes.InvalidYearMonth,
    DataProtectionCodes.InvalidScoringModelVersion,
    DataProtectionCodes.ImpactAssessmentAlreadyRecorded,
  ],
})
export class RecordScoringImpactAssessmentController {
  constructor(private readonly commands: CommandBus) {}

  async handle(request: HttpRequest<{ body: RecordScoringImpactAssessmentBody }>): Promise<Accepted> {
    const id = await this.commands.execute(
      new RecordScoringImpactAssessmentCommand(request.actor, request.body.scoringModelVersion, request.body.month),
    );

    return { id };
  }
}
